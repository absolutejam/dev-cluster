package clusters

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/charmbracelet/log"

	"github.com/absolutejam/dev-cluster/m/cmdwrapper"
	"github.com/absolutejam/dev-cluster/m/globals"
	"github.com/absolutejam/dev-cluster/m/term"
	"github.com/absolutejam/dev-cluster/m/utils"
)

type (
	Cluster struct {
		Name             string
		RepoRelativePath string
		FullPath         string
	}

	UpOpts struct {
		Recreate bool
	}
)

func Up(ctx context.Context, cluster Cluster, opts UpOpts) error {
	log.Info(
		"Creating cluster",
		"cluster", cluster.Name,
		"path", cluster.RepoRelativePath,
	)

	// TODO: Rereate

	cmd := exec.CommandContext(
		ctx,
		"k3d",
		"cluster",
		"create",
		cluster.Name,
		fmt.Sprintf("--config=%s", cluster.FullPath),
	)

	term.ShowCommand(term.ShowCommandOpts{
		Args: cmd.Args,
	})

	tail, err := cmdwrapper.TailCommand(ctx, cmd)
	if err != nil {
		return err
	}

	for {
		select {
		case msg := <-tail.Output():
			fmt.Println(msg.Msg)

		case <-tail.Finished():
			return tail.Error()
		}
	}
}

func Down(ctx context.Context, clusterName string) error {
	log.Info(
		"Remove cluster",
		"cluster", clusterName,
	)

	cmd := exec.CommandContext(
		ctx,
		"k3d",
		"cluster",
		"rm",
		clusterName,
	)

	term.ShowCommand(term.ShowCommandOpts{
		Args: cmd.Args,
	})

	tail, err := cmdwrapper.TailCommand(ctx, cmd)
	if err != nil {
		return err
	}

	for {
		select {
		case msg := <-tail.Output():
			fmt.Println(msg.Msg)

		case <-tail.Finished():
			return tail.Error()
		}
	}
}

func Resolve(clustersRoot string, clusterName string) (*Cluster, error) {
	fullPath := filepath.Join(globals.RepoRoot, clustersRoot, clusterName)
	repoRelativePath := utils.RelativePathFromRepoRoot(fullPath)

	_, err := os.Stat(fullPath)
	if errors.Is(err, fs.ErrNotExist) {
		log.Error(
			"Cluster does not exist",
			"clustername", clusterName,
			"path", repoRelativePath,
		)
		return nil, err
	}

	cluster := &Cluster{
		Name:             clusterName,
		RepoRelativePath: repoRelativePath,
		FullPath:         fullPath,
	}

	return cluster, nil
}

func ListClusters(clustersRoot string) ([]Cluster, error) {
	var clusters []Cluster

	log.Debug("Searching for clusters", "root", clustersRoot)

	searchRoot := filepath.Join(globals.RepoRoot, clustersRoot)
	entries, err := os.ReadDir(searchRoot)
	if err != nil {
		return clusters, err
	}

	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".yaml") {
			var (
				fullPath           = filepath.Join(searchRoot, entry.Name())
				repoRelativePath   = utils.RelativePathFromRepoRoot(fullPath)
				ext                = filepath.Ext(entry.Name())
				fileNameWithoutExt = strings.TrimSuffix(entry.Name(), ext)
			)

			cluster := Cluster{
				Name:             fileNameWithoutExt,
				RepoRelativePath: repoRelativePath,
				FullPath:         fullPath,
			}
			clusters = append(clusters, cluster)
		}
	}

	return clusters, nil
}

func ListRunningClusters(ctx context.Context) ([]string, error) {
	cmd := exec.CommandContext(
		ctx,
		"k3d",
		"cluster",
		"list",
		"-o=json",
	)

	stdout, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	type ListClustersJson struct {
		Name string `json:"name"`
	}

	var resultJson []ListClustersJson
	if err := json.Unmarshal(stdout, &resultJson); err != nil {
		return nil, err
	}

	var clusters []string
	for _, result := range resultJson {
		clusters = append(clusters, result.Name)
	}

	return clusters, nil
}
