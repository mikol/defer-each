# defer-each
Visits at most one item in `list` per event loop, executes `callback()`, and waits for any returned promise to settle before continuing to the next item.
