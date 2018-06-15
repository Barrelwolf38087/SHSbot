# SHSbot

This is the repo for SHSbot.

To install:

```bash
git clone https://github.com/SHSbot/SHSbot.git
cd SHSbot
sudo apt install imagemagick graphicsmagick
npm install
cp example_config.json config.json
nano config.json # SHSbot needs a Discord auth key to work, as well as various other auth keys for other commands. Using nano or another editor, add in api keys.
node . #When "Ready!" is logged, SHSbot is online!
```

If you don't already have it, you will need Node.js & npm:

```bash
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt install nodejs
```

and git:

```bash
sudo apt install git
```
