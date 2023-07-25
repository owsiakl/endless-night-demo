type GLTF = {
    asset: {
        version: string,
    },
    scene: number | undefined,
    meshes: Array<GLTF_mesh> | undefined,
    accessors: Array<GLTF_accessor> | undefined,
    bufferViews: Array<GLTF_buffer_view> | undefined,
    buffers: Array<GLTF_buffer> | undefined,
    scenes: Array<GLTF_scene> | undefined,
    nodes: Array<GLTF_node> | undefined,
    materials: Array<GLTF_material> | undefined,
    textures: Array<GLTF_texture> | undefined,
    images: Array<GLTF_image> | undefined,
    samplers: Array<GLTF_sampler> | undefined,
}

type GLTF_mesh = {
    name: string | undefined,
    primitives: Array<GLTF_primitive>
}

type GLTF_primitive = {
    attributes: {[key: string]: number},
    indices: number | undefined,
    material: number | undefined,
}

type GLTF_accessor = {
    bufferView: number,
    byteOffset: number,
    componentType: GLTF_accessor_component_type,
    count: number,
    type: GLTF_accessor_type,
}

type GLTF_buffer_view = {
    buffer: number,
    byteOffset: number,
    byteLength: number,
    byteStride: number | undefined,
    target: GLTF_buffer_view_target | undefined
}

type GLTF_buffer = {
    uri: string,
    byteLength: number,
}

type GLTF_scene = {
    nodes: Array<number>,
}

type GLTF_node = {
    name: string | undefined,
    mesh: number | undefined,
    skin: number | undefined,
}

type GLTF_material = {
    name: string | undefined,
    pbrMetallicRoughness: GLTF_material_pbr_metallic_roughness | undefined,
}

type GLTF_material_pbr_metallic_roughness = {
    baseColorFactor: [number, number, number, number] | undefined,
    baseColorTexture: GLTF_material_pbr_metallic_roughness_base_color_texture | undefined,
}

type GLTF_material_pbr_metallic_roughness_base_color_texture = {
    index: number,
    texCoord: number | undefined,
}

type GLTF_texture = {
    sampler: number | undefined,
    source: number | undefined,
}

type GLTF_image = {
    name: string | undefined
    bufferView: number | undefined,
    mimeType: string | undefined,
    uri: string | undefined,
}

type GLTF_sampler = {
    minFilter: number | undefined
    magFilter: number | undefined,
    wrapS: number | undefined,
    wrapT: number | undefined,
}

enum GLTF_accessor_component_type {
    BYTE = 5120,
    UNSIGNED_BYTE = 5121,
    SHORT = 5122,
    UNSIGNED_SHORT = 5123,
    UNSIGNED_INT = 5125,
    FLOAT = 5126,
}

enum GLTF_accessor_type {
    SCALAR = 'SCALAR',
    VEC2 = 'VEC2',
    VEC3 = 'VEC3',
    VEC4 = 'VEC4',
    MAT2 = 'MAT2',
    MAT3 = 'MAT3',
    MAT4 = 'MAT4',
}

enum GLTF_buffer_view_target {
    ARRAY_BUFFER = 34962,
    ELEMENT_ARRAY_BUFFER = 34963,
}