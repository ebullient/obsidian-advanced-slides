import { emptyDir, copy, writeFile } from 'fs-extra';
import path from 'path';
import { ObsidianUtils } from '../obsidian/obsidianUtils';

export class RevealExporter {
    private pluginDirectory: string;
    private exportDirectory: string;
    private vaultDirectory: string;

    constructor(utils: ObsidianUtils) {
        this.pluginDirectory = utils.pluginDirectory;
        this.exportDirectory = utils.exportDirectory;
        this.vaultDirectory = utils.vaultDirectory;
    }

    public async export(filePath: string, html: string, imgList: string[]) {
        const ext = path.extname(filePath);
        const folderName = path.basename(filePath).replaceAll(ext, '');
        const folderDir = path.join(this.exportDirectory, folderName);

        await emptyDir(folderDir);
        await writeFile(path.join(folderDir, 'index.html'), html);

        await copy(
            path.join(this.pluginDirectory, 'css'),
            path.join(folderDir, 'css'),
        );
        await copy(
            path.join(this.pluginDirectory, 'dist'),
            path.join(folderDir, 'dist'),
        );
        await copy(
            path.join(this.pluginDirectory, 'plugin'),
            path.join(folderDir, 'plugin'),
        );

        for (const img of imgList) {
            if (img.startsWith('http')) {
                continue;
            }
            await copy(
                path.join(this.vaultDirectory, img),
                path.join(folderDir, img),
            );
        }

        window.open('file://' + folderDir);
    }
}
