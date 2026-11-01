# Release history

Highlights from earlier releases. See [New in 0.7.0](https://protention.dev/#new-in-0-7-0)
for the latest release.

## New in 0.6.0

- **Apache-2.0 license.** Version 0.6.0 and later are released under the Apache
  License 2.0. Versions 0.5.0 and earlier remain under MPL-2.0.
- **IDs can be shortened.** `branch --from`, `compare --from`, and `run --pathway`
  accept the first four or more hexadecimal characters of an ID when they match
  one record.
- **A run on a branch records the branch's parameters.** The child `run` no longer
  repeats them. A `--param` on the run still replaces the value for its key.
- **Stopping the recorder stops the command.** `ocura-oss run` handles `SIGTERM`,
  `SIGHUP`, and Ctrl+Break like Ctrl+C and records the run as `interrupted`. If
  the recorder is killed outright, Windows and Linux end the command; on macOS it
  keeps running.
- **The first error says what to do.** A command run where there is no state names
  `ocura-oss init`, or the directory above that already holds state.

## New in 0.5.0

- **Unfinished runs stay visible.** Each run is journaled before its command starts.
  If the recording process is interrupted twice or killed, `ocura-oss attempts` shows
  the attempt and `ocura-oss recover` closes it as `abandoned` without inventing an outcome.
- **Several runs can share one root.** Concurrent `run` processes are supported, and
  `verify` and `compare` work while runs are in flight.
- **Sensitive values can stay out of records.** `run --no-capture` writes no output
  to disk, and `run --mask-arg` stores a placeholder for a chosen command token.
- **One declaration can label and configure a run.** `run --substitute` fills `{KEY}`
  in the command from the declared parameters and records what it used.
- **Launch context is available on request.** `run --context` records the platform and
  git revision; `--context-file` records a file's digest.
- **Later rewrites can be detected.** `ocura-oss manifest` prints checksums to keep
  elsewhere, and `verify --against` checks the state against them.
- **Verification is stricter.** Every run record must have exactly one branch point.

The core runtime still uses only the standard library. See
[state and verification](https://protention.dev/state/) for the format, attempts,
concurrent use, and the limits of each option.
