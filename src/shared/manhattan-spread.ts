const MaxSpiralSize = 25;

const spiralVectorOffsets: Vector3[] = [];

for (let x = math.floor(-MaxSpiralSize / 2); x <= math.ceil(MaxSpiralSize / 2); x++) {
    for (let y = math.floor(-MaxSpiralSize / 2); y <= math.ceil(MaxSpiralSize / 2); y++) {
        for (let z = math.floor(-MaxSpiralSize / 2); z <= math.ceil(MaxSpiralSize / 2); z++) {
            spiralVectorOffsets.push(new Vector3(x, y, z));
        }
    }
}

table.sort(spiralVectorOffsets, (a, b) => a.Magnitude < b.Magnitude);

export function manhattanSpread(radius: number, visit: (vector: Vector3) => void | 'break') {
    if (radius > MaxSpiralSize) throw 'Spiral is too big; set larger MaxSpiralSize!';
    for (let i = 0; i < radius * radius * radius; i++) {
        if (visit(spiralVectorOffsets[i]) === 'break') {
            break;
        }
    }
}
