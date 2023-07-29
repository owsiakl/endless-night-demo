import {AccessorData} from "../GLTF/Accessor";

export function dump(array: AccessorData|Array<number>, columns: number, name: string = 'DATA')
{
    let columnLength = Array.from(array).reduce(
        (accumulator, current) => accumulator > current.toString().length ? accumulator : current.toString().length,
        0
    );

    // min space between elements
    columnLength += 3;

    // calculate header length
    const rowLength = columnLength * columns + 7;
    const titleLength = name.length;
    const titleSideLength = Math.max((rowLength - titleLength) / 2, 10);

    console.log('='.repeat(titleSideLength) + ` ${name} ` + '='.repeat(titleSideLength));

    for (let i = 0, j = 0; i <= array.length - columns; i += columns,j++) {
        const row = Array.from(array).slice(i, i + columns);

        console.log(
            `${j}.`.padEnd(3, ' ') + '|'.padEnd(row[0].toString().startsWith('-') ? 2 : 3, ' '),
            ...row
                .map((element, index) => {
                    let cellLength = columnLength;
                    let cell = element.toString();

                    if (row[index + 1] && row[index + 1].toString().startsWith('-')) {
                        cellLength -= 1;
                    }

                    if (cell.startsWith('-')) {
                        cellLength += 1;
                    }

                    return cell.padEnd(cellLength, ' ');
                })
        );
    }

    // add empty row after table
    console.log('');
}