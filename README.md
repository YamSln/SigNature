# SigNature

SigNature is an email signature generation app using a premade html template.

## Features

- Reusable information saving, phone numbers, urls...
- Template upload and verification
- Signature preview
- Language change (supports english and hebrew ATM, including RTL)

## Usage

In order to use the app an HTML template should be prepared and uploaded via the settings menu.
- The HTML template cannot run any scripts or contain iframes.
- The app will swap sepcial prefixed charachters in the template with given data from the app:
  - !!name - Full Name
  - !!pos - Position
  - !!email - Email Address
  - !!mobile - Mobile Phone
- Savable data in settings:
  - !!office - Office Phone Number
  - !!fax - Fax Number
  - !!website - Website URL
  - !!linkedin - Linkedin URL
  - !!facebook - Facebook URL
  - !!youtube - Youtube URL
  - !!instagram - Instagram URL
<br>

### Installation and Running

In the apps directory run `npm run build-installer` to build the app and also create a windows installer.
