import path from "path";
import { exec } from "child_process";
import e from "express";
//import { addCheckboxesProperties } from "./frontend/scripts/CheckboxProperties.cjs";

export default function So2Cov(FirstCall, SoFile, executablePath){
    const SoFilePath = path.resolve(SoFile.path);
    const jsonFilePath = path.resolve(SoFilePath + '/../../downloads/properties.json');

    const So2CovExe = `${executablePath}/So2Cov.exe`;
    const FirstSo2CovCommand = `"${So2CovExe}" "11" "${SoFilePath}" "${jsonFilePath}"`;
    const SecondSo2CovCommand = `"${So2CovExe}" "10" "${SoFilePath}" "${jsonFilePath}"`;
    
    const Cov2AnisoExe = `"${executablePath}"/Cov2Aniso.exe`;
    const Cov2AnisoCommand = `"${Cov2AnisoExe}"`// "${VTKFile}"`;

    let terminalCommand;
    switch (process.platform) {
        case 'win32':
            if(FirstCall)
                terminalCommand = `start cmd.exe /k "${FirstSo2CovCommand} & echo The program will automatically close in 5 seconds & timeout /t 5 & exit"`; //&& echo. && set /p answer=Do you want to launch the other function (Y/N)? && if /i !answer! == Y "${Cov2AnisoCommand}" else (exit 1)"`;
            else
                terminalCommand = `start cmd.exe /k "${SecondSo2CovCommand}"`;
            break;
        case 'darwin':
            if(FirstCall)
                terminalCommand = `osascript -e 'tell application "Terminal" to do script "${FirstSo2CovCommand}; echo; The program will automatically close in 5 seconds; sleep 5; exit"'`;
            else
                terminalCommand = `osascript -e 'tell application "Terminal" to do script "${SecondSo2CovCommand}; echo; The program will automatically close in 5 seconds; sleep 5; exit"'`;
            break;
        case 'linux':
            if(FirstCall)
                terminalCommand = `gnome-terminal -- bash -c "${FirstSo2CovCommand}; echo; The program will automatically close in 5 seconds; sleep 5; exit"`;
            else
                terminalCommand = `gnome-terminal -- bash -c "${SecondSo2CovCommand}; echo; The program will automatically close in 5 seconds; sleep 5; exit"`;
            break;
        default:
            throw new Error('Unsupported platform: ' + process.platform);
    }
    return new Promise((resolve, reject) => {
        exec(terminalCommand, (error) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject('Error while executing the file');
            }
            resolve(true);
        });
    });
}