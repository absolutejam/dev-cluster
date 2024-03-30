package globals

import (
	"log"
	"os/exec"
	"strings"

	"github.com/charmbracelet/huh"
	"github.com/pkg/errors"
)

var (
	RepoRoot string
	HuhTheme = huh.ThemeCharm()
)

// This is nasty, but also pretty acceptable for a CLI 🤷
func init() {
	r, err := getRepoRoot()
	if err != nil {
		log.Fatal("Could not look up repo root", "err", err)
	}

	RepoRoot = r
}

func getRepoRoot() (string, error) {
	cmd := exec.Command(
		"git",
		"rev-parse",
		"--path-format=relative",
		"--show-toplevel",
	)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", errors.Wrap(err, "Failed to get repo root")
	}

	return strings.Trim(string(out), "\r\n"), nil
}
