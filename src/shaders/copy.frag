#version 300 es

precision mediump float;

uniform sampler2D state;
uniform vec2 environmentSize;

out vec4 outColor;

void main() {
    outColor = texture(state, gl_FragCoord.xy / environmentSize);
}