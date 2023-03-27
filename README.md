[![Actions Status](https://github.com/Femalopper/autocomplete/actions/workflows/eslint-check.yml/badge.svg)](https://github.com/Femalopper/autocomplete/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/3eb6c53ecd5c8c67c9da/maintainability)](https://codeclimate.com/github/Femalopper/autocomplete/maintainability)

## Description

Demonstration of adaptive responsive submit form. The submit form represents the fields which should be filled with the seed phrases from a given word list with the help of autocomplete. Fill in same words on the validation form to see whether you’ve done it correctly.

---

## Implemented features

:heavy_check_mark: autocomplete technique

:heavy_check_mark: form validation

:heavy_check_mark: copy-paste technique (with copy button/Ctrl+V )

---

## Setup

```sh
   git clone git@github.com:Femalopper/autocomplete.git

   cd autocomplete

   npm ci
```

## Run app

```sh
   cd autocomplete

   npm start
```

## Clipboard access allowed

To access copy/paste:

> Chrome

![Chrome](https://github.com/Femalopper/raw/blob/main/images/react-app-autocomplete/Chrome.png)

> Opera

![Opera](https://github.com/Femalopper/raw/blob/main/images/react-app-autocomplete/Opera.png)

> Firefox

- Enter about:config in navigation bar
- Click "Accept the Risk and Continue"
- Search dom.events.testing.asyncClipboard and set true
- Search dom.events.testing.asyncClipboard.readText and set true

![Firefox](https://github.com/Femalopper/raw/blob/main/images/react-app-autocomplete/Firefox.png)

---

### Autocomplete technique

![Main functionality](https://github.com/Femalopper/raw/blob/main/images/react-app-autocomplete/autocomplete.gif)

### Form validation

<table>
  <tbody>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
    <tr>
      <td style="background:green"></td>
      <td>Filled field</td>
    </tr>
    <tr>
      <td style="background:linear-gradient(to top, rgb(214, 90, 90) 0%, rgb(223, 86, 86) 36%, white 100%)"></td>
      <td>Incorrect field</td>
    </tr>
    <tr>
      <td style="background:linear-gradient(to top, rgb(131, 123, 183) 0%, rgb(140, 147, 241) 36%, white 100%)"></td>
      <td>Changed incorrect field</td>
    </tr>
  </tbody>
</table>

![Form Validation](https://github.com/Femalopper/raw/blob/main/images/react-app-autocomplete/validation.gif)

### Copy-paste technique

![Copy Paste](https://github.com/Femalopper/raw/blob/main/images/react-app-autocomplete/copy-paste.gif)
