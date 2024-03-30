package services

import (
	"context"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/charmbracelet/log"
	dotenv "github.com/joho/godotenv"
	"github.com/pkg/errors"
	"github.com/sethvargo/go-retry"

	"github.com/absolutejam/dev-cluster/m/cmdwrapper"
	"github.com/absolutejam/dev-cluster/m/globals"
	"github.com/absolutejam/dev-cluster/m/term"
	"github.com/absolutejam/dev-cluster/m/utils"
)

type (
	Service struct {
		Name             string
		RepoRelativePath string
		FullPath         string
	}

	DeployOpts struct {
		Retries int
	}

	BuildOpts struct {
		BuildTool BuildTool
		Env       map[string]string
	}

	BootstrapOpts struct {
		BootstrapRoot string
		BuildTool     BuildTool
		BuildOnly     bool
	}
)

type BuildTool int

const (
	BuildToolNode BuildTool = iota
	BuildToolBun
)

func Bootstrap(opts BootstrapOpts) error {
	var (
		envFile    = filepath.Join(globals.RepoRoot, ".env")
		caCertFile = filepath.Join(globals.RepoRoot, "pki", "ca.pem")
		caKeyFile  = filepath.Join(globals.RepoRoot, "pki", "ca-key.pem")

		env = map[string]string{}
	)

	envFileAbs, err := filepath.Abs(envFile)
	if err != nil {
		return err
	}

	_, err = os.Stat(envFileAbs)
	if err == nil {
		_, err := dotenv.Read(envFileAbs)
		if err != nil {
			return err
		}
	}

	caCertAbs, err := filepath.Abs(caCertFile)
	if err == nil {
		contents, err := os.ReadFile(caCertAbs)
		if err != nil {
			return err
		}

		env["PKI_ROOT_CA_CERT"] = string(contents)
	}

	caKeyAbs, err := filepath.Abs(caKeyFile)
	if err == nil {
		contents, err := os.ReadFile(caKeyAbs)
		if err != nil {
			return err
		}
		env["PKI_ROOT_CA_KEY"] = string(contents)

	}

	bootstrapServices, err := ListServices(opts.BootstrapRoot)
	if err != nil {
		return err
	}

	log.Info(
		fmt.Sprintf("Bootstrapping %v services", len(bootstrapServices)),
		"root", opts.BootstrapRoot,
	)

	for _, service := range bootstrapServices {
		err = Build(context.Background(), service, BuildOpts{
			BuildTool: opts.BuildTool,
			Env:       env,
		})
		if err != nil {
			return err
		}

	}

	if opts.BuildOnly {
		return nil
	}

	for _, service := range bootstrapServices {
		log.Info("Deploying", "service", service.Name)
		err = Deploy(context.Background(), service, DeployOpts{})
		if err != nil {
			return err
		}
	}

	return nil
}

func Build(ctx context.Context, service Service, opts BuildOpts) error {
	var (
		entrypoint = "src/main.ts"
		cmd        *exec.Cmd
	)

	log.Info(
		"Building service",
		"service", service.Name,
		"path", service.RepoRelativePath,
		"entrypoint", entrypoint,
	)
	switch opts.BuildTool {
	case BuildToolNode:
		cmd = exec.CommandContext(
			ctx,
			"pnpm",
			"ts-node",
			entrypoint,
		)
	case BuildToolBun:
		cmd = exec.CommandContext(
			ctx,
			"bun",
			"run",
			entrypoint,
		)

	default:
		return fmt.Errorf("unknown build tool: %v", opts.BuildTool)
	}

	if opts.Env != nil {
		// Inherit OS env
		cmd.Env = cmd.Environ()
		for k, v := range opts.Env {
			cmd.Env = append(cmd.Env, fmt.Sprintf("%s=%s", k, v))
		}
	}

	cmd.Dir = service.FullPath

	term.ShowCommand(term.ShowCommandOpts{
		Args: cmd.Args,
		Cwd:  service.RepoRelativePath,
		Env:  opts.Env,
	})

	tail, err := cmdwrapper.TailCommand(ctx, cmd)
	if err != nil {
		return err
	}

	for {
		select {
		case msg := <-tail.Output():
			fmt.Println(msg.Msg)
			if msg.Kind == cmdwrapper.MsgKindStderr {
				log.Error(msg.Msg)
			}

		case <-tail.Finished():
			return tail.Error()
		}
	}
}

func Deploy(ctx context.Context, service Service, opts DeployOpts) error {
	var (
		dist    = filepath.Join(service.FullPath, "dist")
		attempt = 1
	)

	log.Info(
		fmt.Sprintf("Deploying %s", service.Name),
		"path", service.RepoRelativePath,
	)

	return retry.Fibonacci(ctx, time.Second*3, func(ctx context.Context) error {
		if attempt > 1 {
			log.Debug("Retrying deploy", "attempt", attempt)
		}

		cmd := exec.CommandContext(
			ctx,
			"kubectl",
			"apply",
			"-f", dist,
		)
		out, err := cmd.CombinedOutput()
		log.Info(string(out))
		if err != nil {
			return err
		}

		return nil
	})
}

func Resolve(servicesRoot string, serviceName string) (*Service, error) {
	fullPath := filepath.Join(globals.RepoRoot, servicesRoot, serviceName)
	repoRelativePath := utils.RelativePathFromRepoRoot(fullPath)

	_, err := os.Stat(fullPath)
	if errors.Is(err, fs.ErrNotExist) {
		log.Error(
			"Service does not exist",
			"servicename", serviceName,
			"path", repoRelativePath,
		)
		return nil, err
	}

	service := &Service{
		Name:             serviceName,
		RepoRelativePath: repoRelativePath,
		FullPath:         fullPath,
	}

	return service, nil
}

func ListServices(servicesRoot string) ([]Service, error) {
	var services []Service

	log.Debug("Searching for services", "root", servicesRoot)

	searchRoot := filepath.Join(globals.RepoRoot, servicesRoot)
	entries, err := os.ReadDir(searchRoot)
	if err != nil {
		return services, err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			fullPath := filepath.Join(searchRoot, entry.Name())
			repoRelativePath := utils.RelativePathFromRepoRoot(fullPath)

			service := Service{
				Name:             entry.Name(),
				RepoRelativePath: repoRelativePath,
				FullPath:         fullPath,
			}
			services = append(services, service)
		}
	}

	return services, nil
}
