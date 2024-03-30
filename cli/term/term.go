package term

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

var (
	highlightColour = lipgloss.Color("#7AF6F4")

	highlightStyle = lipgloss.NewStyle().Foreground(highlightColour)

	infoBoxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder(), true).
			BorderForeground(highlightColour).
			Width(60).
			Padding(0, 1, 0, 1)
)

func InfoBox(contents string) string {
	return infoBoxStyle.Render(contents)
}

type ShowCommandOpts struct {
	Args []string
	Cwd  string
	Env  map[string]string
}

func ShowCommand(opts ShowCommandOpts) {
	var (
		lines    []string
		envPairs []string
	)
	for k := range opts.Env {
		envPairs = append(envPairs, k)
	}

	lines = append(lines, fmt.Sprintf("%s %s",
		highlightStyle.Render("cmd"),
		strings.Join(opts.Args, " "),
	))

	if opts.Cwd != "" {
		lines = append(lines, fmt.Sprintf("%s %s",
			highlightStyle.Render("cwd"),
			opts.Cwd,
		))
	}

	if opts.Env != nil {
		lines = append(lines, fmt.Sprintf("%s %s",
			highlightStyle.Render("env"),
			strings.Join(envPairs, ","),
		))
	}

	fmt.Println(InfoBox(strings.Join(lines, "\n")))
}
