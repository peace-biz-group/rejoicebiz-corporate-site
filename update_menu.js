const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\info\\rejoicebiz-corporate-site';

function readFilesRecursively(dirPath, filesList = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('.git') && !fullPath.includes('.gemini')) {
                readFilesRecursively(fullPath, filesList);
            }
        } else if (fullPath.endsWith('.html')) {
            filesList.push(fullPath);
        }
    });
    return filesList;
}

const htmlFiles = readFilesRecursively(dir);

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Check if it's a redirect file by looking for '<meta http-equiv="refresh"'
    if (content.includes('<meta http-equiv="refresh"')) {
        return;
    }

    // 1. Header Container
    if (content.match(/class="[^"]*container mx-auto px-6 h-24[^"]*"/)) {
        content = content.replace(/class="([^"]*)container mx-auto px-6 h-24([^"]*)"/g, 'class="$1container mx-auto px-4 sm:px-6 h-20 sm:h-24$2"');
        changed = true;
    }

    // 2. Header logo link gap
    if (content.match(/class="flex items-center gap-3 z-50"/)) {
        content = content.replace(/class="flex items-center gap-3 z-50"/g, 'class="flex items-center gap-2 sm:gap-3 z-50"');
        changed = true;
    }

    // 3. Header logo image sizing
    if (content.match(/class="h-10 w-auto/)) {
        content = content.replace(/class="h-10 w-auto/g, 'class="h-8 sm:h-10 w-auto');
        changed = true;
    }

    // 4. Header text sizing
    if (content.match(/class="font-eng font-bold text-2xl/)) {
        content = content.replace(/class="font-eng font-bold text-2xl/g, 'class="font-eng font-bold text-xl sm:text-2xl');
        changed = true;
    }

    // 5. Mobile Menu Overlay block
    const menuStartStr = '<!-- Mobile Menu Overlay -->';
    const menuStart = content.indexOf(menuStartStr);
    if (menuStart !== -1) {
        // Find closing div for this block
        const idMobileMenu = content.indexOf('id="mobile-menu"', menuStart);
        if (idMobileMenu !== -1) {
            // we will find the closing </div> safely. 
            // In these templates it's usually around 1000 chars later.
            const endContact = content.indexOf('/contact/', idMobileMenu);
            const blockEnd = content.indexOf('</div>', endContact) + 6;
            
            if (endContact !== -1 && blockEnd !== -1) {
                let block = content.substring(menuStart, blockEnd);
                let originalBlock = block;
                
                // Perform replacements in order
                block = block.replace(/text-xl font-bold/g, 'text-lg font-bold');
                block = block.replace(/text-2xl font-bold/g, 'text-xl font-bold');
                block = block.replace(/space-y-4/g, 'space-y-3');
                block = block.replace(/justify-center px-8 space-y-6/g, 'justify-start pt-24 pb-12 px-6 space-y-5');

                if (block !== originalBlock) {
                    content = content.substring(0, menuStart) + block + content.substring(blockEnd);
                    changed = true;
                }
            }
        }
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${path.basename(file)}`);
    }
});
