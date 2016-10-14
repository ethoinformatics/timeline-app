# Bug Fixes Documentation

Running documentation of bug fixes organized by category

## User Interface

### 10/2016 Side Menu:
https://github.com/ethoinformatics/ethoinfo-project-app/issues/41

Issue: Menu burger disappears on home screen after navigating to Settings > User and then exiting the menu.

This bug can be tracked to event handling and control flow issues and is likely symptomatic of the way events and state are currently handled throughout the app.

Menu state  and appearance are modified in two different places:
* public method ```close()```, which calls private method ```openCloseLeftMenu()```
* anonymous function bound to the burger and "X" button clicks.

When the burger and "X" buttons are clicked, both functions are called in order. When an item in the menu is clicked, only the ```close``` --> ```openCloseLeftMenu()``` method is called and the menu appearance becomes out of sync with its state.

Bug is fixed by moving all state mutation and presentation logic to a single function.