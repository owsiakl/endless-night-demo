type khr_gltf = {
    asset: {
        version: string,
    },
    scene: number | undefined,
    meshes: Array<khr_gltf_mesh> | undefined,
    accessors: Array<khr_gltf_accessor> | undefined,
    bufferViews: Array<khr_gltf_buffer_view> | undefined,
    buffers: Array<khr_gltf_buffer> | undefined,
    scenes: Array<khr_gltf_scene> | undefined,
    nodes: Array<khr_gltf_node> | undefined,
    materials: Array<khr_gltf_material> | undefined,
    textures: Array<khr_gltf_texture> | undefined,
    images: Array<khr_gltf_image> | undefined,
    samplers: Array<khr_gltf_sampler> | undefined,
    animations: Array<khr_gltf_animation> | undefined,
    skins: Array<khr_gltf_skin> | undefined,
}

type khr_gltf_mesh = {
    name: string | undefined,
    primitives: Array<khr_gltf_primitive>
}

type khr_gltf_primitive = {
    attributes: {[key: string]: number},
    indices: number | undefined,
    material: number | undefined,
}

type khr_gltf_accessor = {
    bufferView: number,
    byteOffset: number | undefined,
    componentType: khr_gltf_accessor_component_type,
    count: number,
    type: khr_gltf_accessor_type,
}

type khr_gltf_buffer_view = {
    buffer: number,
    byteOffset: number | undefined,
    byteLength: number,
    byteStride: number | undefined,
    target: khr_gltf_buffer_view_target | undefined
}

type khr_gltf_buffer = {
    uri: string,
    byteLength: number,
    binary: ArrayBuffer | undefined,
}

type khr_gltf_scene = {
    nodes: Array<number>,
}

type khr_gltf_node = {
    name: string | undefined,
    mesh: number | undefined,
    skin: number | undefined,
    children: Array<number> | undefined,
    translation: [number, number, number] | undefined,
    rotation: [number, number, number, number] | undefined,
    scale: [number, number, number] | undefined,
    matrix: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | undefined,
}

type khr_gltf_material = {
    name: string | undefined,
    pbrMetallicRoughness: khr_gltf_material_pbr_metallic_roughness | undefined,
}

type khr_gltf_material_pbr_metallic_roughness = {
    baseColorFactor: [number, number, number, number] | undefined,
    baseColorTexture: khr_gltf_material_pbr_metallic_roughness_base_color_texture | undefined,
}

type khr_gltf_material_pbr_metallic_roughness_base_color_texture = {
    index: number,
    texCoord: number | undefined,
}

type khr_gltf_texture = {
    sampler: number | undefined,
    source: number | undefined,
}

type khr_gltf_image = {
    name: string | undefined
    bufferView: number | undefined,
    mimeType: string | undefined,
    uri: string | undefined,
}

type khr_gltf_sampler = {
    minFilter: number | undefined,
    magFilter: number | undefined,
    wrapS: number | undefined,
    wrapT: number | undefined,
}

type khr_gltf_animation = {
    name: string | undefined,
    channels: Array<khr_gltf_animation_channel>,
    samplers: Array<khr_gltf_animation_sampler>,
}

type khr_gltf_animation_channel = {
    sampler: number,
    target: {
        node: number | undefined,
        path: string,
    },
}

type khr_gltf_animation_sampler = {
    input: number,
    interpolation: string | undefined,
    output: number,
}

type khr_gltf_skin = {
    inverseBindMatrices: number,
    joints: Array<number>,
}

enum khr_gltf_accessor_component_type {
    BYTE = 5120,
    UNSIGNED_BYTE = 5121,
    SHORT = 5122,
    UNSIGNED_SHORT = 5123,
    UNSIGNED_INT = 5125,
    FLOAT = 5126,
}

enum khr_gltf_accessor_type {
    SCALAR = 'SCALAR',
    VEC2 = 'VEC2',
    VEC3 = 'VEC3',
    VEC4 = 'VEC4',
    MAT2 = 'MAT2',
    MAT3 = 'MAT3',
    MAT4 = 'MAT4',
}

enum khr_gltf_buffer_view_target {
    ARRAY_BUFFER = 34962,
    ELEMENT_ARRAY_BUFFER = 34963,
}