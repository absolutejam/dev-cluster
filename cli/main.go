package main

import (
	"context"
	"fmt"
	"os"

	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/log"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"

	"github.com/absolutejam/dev-cluster/m/clusters"
	"github.com/absolutejam/dev-cluster/m/globals"
	"github.com/absolutejam/dev-cluster/m/services"
)

func buildServiceError(err error) error {
	return errors.Wrap(err, "Failed to build service")
}

const (
	FlagVerbose       = "verbose"
	FlagServicesRoot  = "services-root"
	FlagBootstrapRoot = "bootstrap-root"
	FlagUseBun        = "use-bun"
	FlagBuildOnly     = "build-only"
	FlagBuild         = "build"

	FlagClustersRoot = "clusters-root"
)

//------------------------------------------------------------------------------

func serviceSelector(s []services.Service, includeBuildOption bool) ([]services.Service, bool, error) {
	var (
		selectedServices []services.Service
		build            bool
		options          []huh.Option[services.Service]
		err              error = nil
	)

	if len(s) == 0 {
		err := errors.New("no services provided")
		return selectedServices, build, err
	}

	for _, service := range s {
		options = append(options, huh.NewOption(service.Name, service))
	}

	var (
		servicesMultiSelect = huh.NewMultiSelect[services.Service]().
					Title("Services").
					Options(options...).
					Value(&selectedServices)

		buildConfirm = huh.NewConfirm().
				Title("(Re)build service?").
				Value(&build)
	)

	fields := []huh.Field{servicesMultiSelect}
	if includeBuildOption {
		fields = append(fields, buildConfirm)
	}

	form := huh.NewForm(huh.NewGroup(fields...)).WithTheme(globals.HuhTheme)

	err = form.Run()
	return selectedServices, build, err
}

func clusterConfigSelector(c []clusters.Cluster) (*clusters.Cluster, error) {
	var (
		options         []huh.Option[clusters.Cluster]
		selectedCluster clusters.Cluster
	)

	if len(c) == 0 {
		err := errors.New("no clusters provided")
		return &selectedCluster, err
	}

	for _, cluster := range c {
		options = append(options, huh.NewOption(cluster.Name, cluster))
	}

	clustersSelect := huh.NewSelect[clusters.Cluster]().
		Title("Clusters").
		Options(options...).
		Value(&selectedCluster)

	err := huh.NewForm(huh.NewGroup(clustersSelect)).
		WithTheme(globals.HuhTheme).
		Run()

	return &selectedCluster, err
}

func confirmSelector(title string) (bool, error) {
	var (
		confirm         bool
		confirmSelector = huh.NewConfirm().
				Title(title).
				Value(&confirm)
	)

	err := huh.NewForm(huh.NewGroup(confirmSelector)).
		WithTheme(globals.HuhTheme).
		Run()
	if err != nil {
		return confirm, err
	}

	return confirm, nil
}

func runningClusterSelector(c []string) (string, error) {
	var (
		options         []huh.Option[string]
		selectedCluster string
		err             error = nil
	)

	if len(c) == 0 {
		err := errors.New("no running clusters")
		return selectedCluster, err
	}

	for _, cluster := range c {
		options = append(options, huh.NewOption(cluster, cluster))
	}

	var (
		clustersSelect = huh.NewSelect[string]().
			Title("Running clusters").
			Options(options...).
			Value(&selectedCluster)
	)

	fields := []huh.Field{clustersSelect}
	form := huh.NewForm(huh.NewGroup(fields...)).WithTheme(globals.HuhTheme)

	err = form.Run()
	return selectedCluster, err
}

//------------------------------------------------------------------------------

var (
	rootCmd = &cobra.Command{
		Use:   "dev-cluster",
		Short: "For managing a local dev cluster",
		PersistentPreRun: func(cmd *cobra.Command, _ []string) {
			if verbose, _ := cmd.Flags().GetBool(FlagVerbose); verbose {
				log.SetLevel(log.DebugLevel)
			}
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			return cmd.Help()
		},
	}

	buildCmd = &cobra.Command{
		Use:   "build [service]",
		Short: "Build a service",
		RunE:  buildFunc,
	}

	deployCmd = &cobra.Command{
		Use:   "deploy [service]",
		Short: "Deploy a service",
		Args:  cobra.RangeArgs(0, 1),
		RunE:  deployFunc,
	}

	bootstrapCmd = &cobra.Command{
		Use:   "bootstrap",
		Short: "Run bootstrap process",
		Args:  cobra.NoArgs,
		RunE:  bootstrapFunc,
	}

	clusterCmd = &cobra.Command{
		Use:   "cluster",
		Short: "Manage cluster",
	}

	clusterUpCmd = &cobra.Command{
		Use:   "up",
		Short: "Spin up the provided cluster",
		Args:  cobra.RangeArgs(0, 1),
		RunE:  clusterUpFunc,
	}

	clusterDownCmd = &cobra.Command{
		Use:   "down",
		Short: "Spin down the provided cluster",
		Args:  cobra.RangeArgs(0, 1),
		RunE:  clusterDownFunc,
	}
)

func buildFunc(cmd *cobra.Command, args []string) error {
	var (
		servicesToBuild []services.Service
		buildTool       = services.BuildToolNode
		servicesRoot    string
		useBun          bool
		err             error = nil
	)

	if servicesRoot, err = cmd.Flags().GetString(FlagServicesRoot); err != nil {
		return err
	}
	if useBun, err = cmd.Flags().GetBool(FlagUseBun); err != nil {
		return err
	}

	if useBun {
		buildTool = services.BuildToolBun
	}

	if len(args) == 0 {
		allServices, err := services.ListServices(servicesRoot)
		if err != nil {
			return err
		}

		selected, _, err := serviceSelector(allServices, false)
		if err != nil {
			return err
		}

		servicesToBuild = selected
	} else {
		for _, arg := range args {
			service, err := services.Resolve(servicesRoot, arg)
			if err != nil {
				return err
			}

			servicesToBuild = append(servicesToBuild, *service)
		}
	}

	log.Infof("%v services selected", len(servicesToBuild))

	for _, service := range servicesToBuild {
		err := services.Build(context.Background(), service, services.BuildOpts{
			BuildTool: buildTool,
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func deployFunc(cmd *cobra.Command, args []string) error {
	var (
		servicesToDeploy []services.Service
		buildTool        = services.BuildToolNode
		useBun           bool
		shouldBuild      bool
		servicesRoot     string
		err              error = nil
	)

	if useBun, err = cmd.Flags().GetBool(FlagUseBun); err != nil {
		return err
	}
	if servicesRoot, err = cmd.Flags().GetString(FlagServicesRoot); err != nil {
		return err
	}

	if useBun {
		buildTool = services.BuildToolBun
	}

	if len(args) == 0 {
		allServices, err := services.ListServices(servicesRoot)
		if err != nil {
			return err
		}

		selected, build, err := serviceSelector(allServices, true)
		if err != nil {
			return err
		}

		servicesToDeploy = selected
		shouldBuild = build
	} else {
		if shouldBuild, err = cmd.Flags().GetBool(FlagBuild); err != nil {
			return err
		}

		for _, arg := range args {
			service, err := services.Resolve(servicesRoot, arg)
			if err != nil {
				return err
			}

			servicesToDeploy = append(servicesToDeploy, *service)
		}
	}

	log.Info(
		fmt.Sprintf("%v services selected", len(servicesToDeploy)),
		"build", shouldBuild,
	)

	for _, service := range servicesToDeploy {
		if shouldBuild {
			err := services.Build(
				context.Background(),
				service,
				services.BuildOpts{BuildTool: buildTool},
			)
			if err != nil {
				return err
			}
		}

		services.Deploy(context.Background(), service, services.DeployOpts{Retries: 5})
		if err != nil {
			return err
		}
	}

	return nil
}

func bootstrapFunc(cmd *cobra.Command, args []string) error {
	var (
		buildTool     = services.BuildToolNode
		buildOnly     bool
		useBun        bool
		bootstrapRoot string
		err           error = nil
	)

	if buildOnly, err = cmd.Flags().GetBool(FlagBuildOnly); err != nil {
		return err
	}
	if useBun, err = cmd.Flags().GetBool(FlagUseBun); err != nil {
		return err
	}
	if bootstrapRoot, err = cmd.Flags().GetString(FlagBootstrapRoot); err != nil {
		return err
	}

	if useBun {
		buildTool = services.BuildToolBun
	}

	err = services.Bootstrap(services.BootstrapOpts{
		BootstrapRoot: bootstrapRoot,
		BuildOnly:     buildOnly,
		BuildTool:     buildTool,
	})
	if err != nil {
		return err
	}

	return nil
}

func clusterUpFunc(cmd *cobra.Command, args []string) error {
	var (
		clustersRoot string

		cluster  *clusters.Cluster
		recreate bool
		err      error = nil
	)

	if clustersRoot, err = cmd.Flags().GetString(FlagClustersRoot); err != nil {
		return err
	}

	if len(args) == 0 {
		allClusters, err := clusters.ListClusters(clustersRoot)
		if err != nil {
			return err
		}

		cluster, err = clusterConfigSelector(allClusters)
		if err != nil {
			return err
		}
	} else {
		cluster, err = clusters.Resolve(clustersRoot, args[0])
		if err != nil {
			return err
		}
	}

	runningClusters, _ := clusters.ListRunningClusters(context.Background())
	for _, runningCluster := range runningClusters {
		if runningCluster == cluster.Name {
			log.Info("Cluster already running", "clustername", cluster.Name)
			recreate, err = confirmSelector("Recreate cluster?")
			if err != nil {
				return err
			}

			if !recreate {
				os.Exit(0)
			}
		}
	}

	return clusters.Up(context.Background(), *cluster, clusters.UpOpts{
		Recreate: recreate,
	})
}

func clusterDownFunc(cmd *cobra.Command, args []string) error {
	var (
		clusterName string
		err         error = nil
	)

	runningClusters, err := clusters.ListRunningClusters(context.Background())
	if err != nil {
		return err
	}

	if len(args) == 0 {
		clusterName, err = runningClusterSelector(runningClusters)
		if err != nil {
			return err
		}
	} else {
		for _, runningCluster := range runningClusters {
			if runningCluster == args[0] {
				clusterName = runningCluster
				break
			}

			return fmt.Errorf("no running cluster named %s", args[0])
		}
	}

	return clusters.Down(context.Background(), clusterName)
}

//------------------------------------------------------------------------------

func main() {
	var (
		logger       = log.Default()
		customStyles = log.DefaultStyles()
	)

	//----------------------------------------------------------------------

	logger.SetTimeFormat("15:04:05")
	logger.SetFormatter(log.TextFormatter)
	logger.SetStyles(customStyles)
	log.SetDefault(logger)

	//----------------------------------------------------------------------

	rootCmd.PersistentFlags().BoolP(FlagVerbose, "v", false, "Enable debug logging")

	buildCmd.Flags().String(FlagServicesRoot, "k8s/services", "Services root")
	buildCmd.Flags().Bool(FlagUseBun, false, "Use bun as the build tool")

	deployCmd.Flags().String(FlagServicesRoot, "k8s/services", "Services root")
	deployCmd.Flags().Bool(FlagUseBun, false, "Use bun as the build tool")

	bootstrapCmd.Flags().Bool(FlagUseBun, false, "Use bun as the build tool")
	bootstrapCmd.Flags().BoolP(FlagBuildOnly, "b", false, "Build and do not deploy")
	bootstrapCmd.Flags().String(FlagBootstrapRoot, "k8s/bootstrap", "Bootstrap root")

	clusterCmd.AddCommand(clusterUpCmd)
	clusterCmd.AddCommand(clusterDownCmd)
	clusterCmd.PersistentFlags().String(FlagClustersRoot, "cluster", "Clusters root")

	rootCmd.AddCommand(buildCmd)
	rootCmd.AddCommand(deployCmd)
	rootCmd.AddCommand(bootstrapCmd)
	rootCmd.AddCommand(clusterCmd)

	rootCmd.SilenceUsage = true
	rootCmd.SilenceErrors = true

	//----------------------------------------------------------------------

	if err := rootCmd.Execute(); err != nil {
		log.Fatal(err)
	}
}
