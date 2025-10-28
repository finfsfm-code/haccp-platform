import React from 'react';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // This renderer is specifically tuned for markdown tables and basic text formatting.
    const processLine = (line: string) => {
        if (line.trim() === '') return '<br/>';
        if (line.startsWith('### ')) return `<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-700">${line.substring(4)}</h3>`;
        if (line.startsWith('**')) return `<p><strong>${line.replace(/\*\*/g, '')}</strong></p>`;
        if (line.startsWith('- ')) return `<li class="ml-6 list-disc">${line.substring(2)}</li>`;
        return `<p>${line}</p>`;
    }

    const html = content.split('\n').map(line => {
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            return line; // Handle tables separately
        }
        return processLine(line);
    }).join('')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    const tableHtml = html.replace(/((?:\|.*\|(?:\r?\n|$))+)/g, (tableMatch) => {
        const rows = tableMatch.trim().split('\n');
        if (rows.length < 2) return tableMatch; // Not a valid table

        const headerRow = rows[0];
        const separatorRow = rows[1];

        if (!separatorRow.includes('---')) return tableMatch; // No header separator

        const headers = headerRow.slice(1, -1).split('|').map(h => `<th scope="col" class="px-4 py-2">${h.trim()}</th>`).join('');
        
        const bodyRows = rows.slice(2).map(rowStr => {
            const cells = rowStr.slice(1, -1).split('|').map(c => `<td class="px-4 py-3">${c.trim()}</td>`).join('');
            return `<tr class="bg-white border-b">${cells}</tr>`;
        }).join('');

        return `
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-700 border-collapse mt-4">
                    <thead class="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>${headers}</tr>
                    </thead>
                    <tbody>
                        ${bodyRows}
                    </tbody>
                </table>
            </div>
        `;
    });

    return <div className="prose prose-slate max-w-none leading-relaxed text-slate-800" dangerouslySetInnerHTML={{ __html: tableHtml }} />;
};

export default MarkdownRenderer;