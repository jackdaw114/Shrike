export function parseOBJ(objFile) {
    const positions = [];
    const texCoords = [];
    const normals = [];
    const indices = [];
    
    // This will store the final interleaved vertex data
    const vertices = [];

    // A map to avoid duplicating vertices (for indexed drawing)
    const vertexMap = new Map();
    
    // Go through each line in the OBJ file
    const lines = objFile.split("\n");

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length === 0) continue;

        // Parse vertices
        if (parts[0] === 'v') {
            positions.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
        }
        // Parse texture coordinates
        else if (parts[0] === 'vt') {
            texCoords.push(parseFloat(parts[1]), parseFloat(parts[2]));
        }
        // Parse vertex normals
        else if (parts[0] === 'vn') {
            
            normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
        }
        // Parse faces (triangles)
        else if (parts[0] === 'f') {
            for (let i = 1; i < parts.length; i++) {
                const indicesSet = parts[i].split('/');
                const positionIndex = parseInt(indicesSet[0]) - 1;
                const texCoordIndex = parseInt(indicesSet[1]) - 1;
                const normalIndex = parseInt(indicesSet[2]) - 1;

                console.log(positionIndex,texCoordIndex,normalIndex)
                // Create a unique key for this vertex combination
                const vertexKey = `${positionIndex}/${texCoordIndex}/${normalIndex}`;
                
                if (!vertexMap.has(vertexKey)) {
                    // Store the vertex data in the final interleaved format
                    
                    vertices.push(
                        positions[3 * positionIndex],    // x
                        positions[3 * positionIndex + 1], // y
                        positions[3 * positionIndex + 2], // z
                        texCoords[2 * texCoordIndex],     // u
                        texCoords[2 * texCoordIndex + 1], // v
                        normals[3 * normalIndex],         // nx
                        normals[3 * normalIndex + 1],     // ny
                        normals[3 * normalIndex + 2]      // nz
                    );

                    vertexMap.set(vertexKey, vertices.length / 8 - 1);
                }

                // Add index to the index buffer
                indices.push(vertexMap.get(vertexKey));
            }
            console.log(vertices)
            console.log(indices)
        }
    }
    
    return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };
}
