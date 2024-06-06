import path from "path";
import { exec } from "child_process";

export function Cov2Aniso(){
    // Execute the command asynchronously in a new terminal window
    const executablePath = path.resolve(process.env.GPM_DIR, "build/Desktop_Qt_6_7_1_MSVC2019_64bit-Release/Conformity/Cov2Anis/release/Cov2Aniso.exe");
    const command = `"${executablePath}"`;

    let terminalCommand;

    switch (process.platform) {
        case 'win32':
            terminalCommand = `start cmd.exe /k "${command}"`;
            break;
        case 'darwin':
            terminalCommand = `osascript -e 'tell application "Terminal" to do script "${command}"'`;
            break;
        case 'linux':
            terminalCommand = `gnome-terminal -- bash -c "${command}; exec bash"`;
            break;
        default:
            throw new Error('Unsupported platform: ' + process.platform);
    }

    exec(terminalCommand, (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error while executing the file');
        }
    });

}

export function So2Cov(SoFile){
    // Execute the command asynchronously in a new terminal window
    const filePath = path.resolve(SoFile.path);
    console.log(filePath);
    const executablePath = path.resolve(process.env.GPM_DIR, "build/Desktop_Qt_6_7_1_MSVC2019_64bit-Release/Conformity/So2Cov/release/So2Cov.exe");
    const command = `"${executablePath}" "${filePath}"`;

    let terminalCommand;

    switch (process.platform) {
        case 'win32':
            terminalCommand = `start cmd.exe /k "${command}"`;
            break;
        case 'darwin':
            terminalCommand = `osascript -e 'tell application "Terminal" to do script "${command}"'`;
            break;
        case 'linux':
            terminalCommand = `gnome-terminal -- bash -c "${command}; exec bash"`;
            break;
        default:
            throw new Error('Unsupported platform: ' + process.platform);
    }

    exec(terminalCommand, (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error while executing the file');
        }
    });
}