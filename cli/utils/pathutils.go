package utils

import "strings"

func RelativePathFromRepoRoot(path string) string {
	return strings.ReplaceAll(path, "../", "")
}
