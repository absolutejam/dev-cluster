package cmdwrapper

import (
	"bufio"
	"context"
	"os/exec"
	"sync"
)

type Message struct {
	Msg  string
	Kind string
}

const (
	MsgKindStdout = "stdout"
	MsgKindStderr = "stderr"
)

type CmdTail struct {
	context context.Context
	done    <-chan bool
	msgs    <-chan Message
	err     error

	goroutines []string
	mu         sync.RWMutex
}

func (c *CmdTail) Finished() <-chan bool {
	return c.done
}

func (c *CmdTail) Output() <-chan Message {
	return c.msgs
}

func (c *CmdTail) Cancelled() <-chan struct{} {
	return c.context.Done()
}

func (c *CmdTail) Context() context.Context {
	return c.context
}

func (c *CmdTail) Error() error {
	return c.err
}

//------------------------------------------------------------------------------

func TailCommand(ctx context.Context, cmd *exec.Cmd) (*CmdTail, error) {
	var (
		msgs = make(chan Message)

		wg      = sync.WaitGroup{}
		cmdDone = make(chan bool, 1)
		pubDone = make(chan bool, 1)

		tail = &CmdTail{
			context: ctx,
			done:    pubDone,
			msgs:    msgs,
		}
	)

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, err
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}

	err = cmd.Start()
	if err != nil {
		return nil, err
	}

	stdoutScanner := bufio.NewScanner(stdout)
	stdoutScanner.Split(bufio.ScanLines)

	stderrScanner := bufio.NewScanner(stderr)
	stderrScanner.Split(bufio.ScanLines)

	// NOTE: This is used to trigger cancellation via. `exec.CommandContext`
	go func() {
		cmd.Wait()
		cmdDone <- true
	}()

	// stream messages until done
	streamMessages := func(messageKind string, scanner *bufio.Scanner) {
		wg.Add(1)

		go func() {
			defer wg.Done()
		loop:
			for {
				select {
				case <-cmdDone:
					break loop

				case <-ctx.Done():
					break loop

				default:
					if scanner.Scan() {
						msg := Message{Msg: scanner.Text(), Kind: messageKind}
						msgs <- msg
						continue
					}
					break loop
				}
			}

			if err := scanner.Err(); err != nil {
				tail.err = err
			}
		}()
	}

	streamMessages(MsgKindStdout, stdoutScanner)
	streamMessages(MsgKindStderr, stderrScanner)

	// Wait for stdout and stderr streaming to complete
	go func() {
		wg.Wait()
		close(msgs)

		// so the consumer can await the command completion
		pubDone <- true
	}()

	return tail, nil
}
