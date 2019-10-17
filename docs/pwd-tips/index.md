
## Creating Files

If you're new to a Linux terminal, don't worry! The easiest way to create a file is to use the `touch` command.

```bash
touch Dockerfile
```

If you run `ls`, you'll see that the file has been created. Once created, you can use the **Editing Files** tips below.


## Editing Files

In PWD, you are welcome to use any CLI-based editor. However, we know many folks aren't as comfortable in the CLI.
You are welcome to click on the "Editor" button to get a file manager view.

![Editor Button](editor-button.png){: style=width:50% }
{:.text-center}

After clicking the editor button, the file editor will open. Selecting a file will provide a web-based editor.

![Editor Display](editor-display.png){: style=width:75% }
{: .text-center }


## Opening an App when the badge is gone

If you have started a container, but the port badge doesn't come up, there is a way to still open the app.

1. First, validate the container is actually running and didn't just fail to start. Run `docker ps` and 
   verify there is a port mapping in the `PORTS` section.

    ```bash
    $ docker ps
    CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                    NAMES
    976e7066d705        docker-101          "docker-entrypoint.s…"   2 seconds ago       Up 1 second         0.0.0.0:3000->3000/tcp   xenodochial_ritchie
    ```
  
    If the container failed to start, check the container logs and try to figure out what might be going on.

1. In PWD, find the `SSH` display. It should have a display that looks like `ssh ip172...`. Copy everything AFTER
   the `ssh` portion (`ip172....`).

1. Paste that into the web browser, but do NOT hit enter yet. Find the `@` symbol. Replace it with `-PORT.` For example,
   if I had `ip172-18-0-22-bmf9t2ds883g009iqq80@direct.labs.play-with-docker.com` and wanted to look at port 3000, I would
   open <code>ip172-18-0-22-bmf9t2ds883g009iqq80<strong>-3000</strong>.direct.labs.play-with-docker.com</code>.

   