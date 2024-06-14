import path from "path";
import { exec } from "child_process";
//import { addCheckboxesProperties } from "./frontend/scripts/CheckboxProperties.cjs";

export default function So2Cov(SoFile, executablePath){
    const SoFilePath = path.resolve(SoFile.path);
    const jsonFilePath = path.resolve(SoFilePath + '/../../downloads/properties.json');

    const So2CovExe = `${executablePath}/So2Cov.exe`;
    const So2CovCommand = `"${So2CovExe}" "${SoFilePath}" "${jsonFilePath}"`;
    
    const Cov2AnisoExe = `"${executablePath}"/Cov2Aniso.exe`;
    const Cov2AnisoCommand = `"${Cov2AnisoExe}"`// "${VTKFile}"`;

    let terminalCommand;
    switch (process.platform) {
        case 'win32':
            terminalCommand = `start cmd.exe /k "${So2CovCommand} & echo the program will automatically close in 3 seconds & timeout /t 3 & exit"`; //&& echo. && set /p answer=Do you want to launch the other function (Y/N)? && if /i !answer! == Y "${Cov2AnisoCommand}" else (exit 1)"`;
            break;
        case 'darwin':
            terminalCommand = `osascript -e 'tell application "Terminal" to do script "${So2CovCommand}; echo; read -p \\"Do you want to launch the other function (Y/N)? \\" answer; if [ \\"$answer\\" = \\"Y\\" ]; then echo \\"Launching other function\\"; exit 0; else exit 1; fi"'`;
            break;
        case 'linux':
            terminalCommand = `gnome-terminal -- bash -c "${So2CovCommand}; echo; read -p 'Do you want to launch the other function (Y/N)? ' answer; if [ \\"$answer\\" = 'Y' ]; then echo 'Launching other function'; exit 0; else exit 1; fi; exec bash"`;
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