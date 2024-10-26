# gippity

A VS Code extension that allows you to use the OpenAI API to directly interact with your code.

## Features

* Select a piece of code and write a comment with an instruction starting with "instruction"
* The selected code will be replaced with the AI's suggestion
* The whole file is sent to the AI, so you can refer to variables, functions, etc. in your instruction

## Requirements

* OpenAI API key

## Extension Settings

* `gippity.apiKey`: The OpenAI API key used for making API calls.
* `gippity.model`: The OpenAI model to use for calls. Options are 'gpt-4o' | 'gpt-4o-2024-05-13' | 'gpt-4o-2024-08-06' | 'gpt-4o-mini' | 'gpt-4o-mini-2024-07-18' | 'gpt-4-turbo' | 'gpt-4-turbo-2024-04-09' | 'gpt-4-0125-preview' | 'gpt-4-turbo-preview' | 'gpt-4-1106-preview' | 'gpt-4-vision-preview' | 'gpt-4' | 'gpt-4-0314' | 'gpt-4-0613' | 'gpt-4-32k' | 'gpt-4-32k-0314' | 'gpt-4-32k-0613' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-3.5-turbo-0301' | 'gpt-3.5-turbo-0613' | 'gpt-3.5-turbo-1106' | 'gpt-3.5-turbo-0125' | 'gpt-3.5-turbo-16k-0613'

## Known Issues

* The extension doesn't handle errors well, so if something goes wrong, you might not get a useful error message.

## Release Notes

### 0.0.1

Initial Release
