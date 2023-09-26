import {Assets} from "./Core/Assets";
import {EndlessNight} from "./Main/EndlessNight";
import {WindowDecorator} from "./Core/WindowDecorator";

const windowDecorator = new WindowDecorator(window);
const assets = new Assets();
const game = new EndlessNight(windowDecorator, assets);

assets.importShader('default_vertex', '/shader/default/vertex.glsl');
assets.importShader('default_fragment', '/shader/default/fragment.glsl');
assets.importShader('depth_vertex', '/shader/depth/vertex.glsl');
assets.importShader('depth_fragment', '/shader/depth/fragment.glsl');
assets.importShader('particle_emit_vertex', '/shader/particle/emit/vertex.glsl');
assets.importShader('particle_emit_fragment', '/shader/particle/emit/fragment.glsl');
assets.importShader('particle_render_vertex', '/shader/particle/render/vertex.glsl');
assets.importShader('particle_render_fragment', '/shader/particle/render/fragment.glsl');

assets.importImage('fire_particle', '/image/fire.png');
assets.importImage('ground', '/image/ground.jpg');
assets.importImage('ground_normal', '/image/ground_normal.jpg');

assets.importBinaryModel('akai', '/model/akai.glb');
assets.importBinaryModel('torch', '/model/torch.glb');

windowDecorator.addEventListener('DOMContentLoaded', () => {
    assets.load(() => game.bootstrap())
});