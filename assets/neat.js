(function(X,q){typeof exports=="object"&&typeof module<"u"?q(exports):typeof define=="function"&&define.amd?define(["exports"],q):(X=typeof globalThis<"u"?globalThis:X||self,q(X.neat={}))})(this,function(X){"use strict";const q=`void main() {
vUv = uv;
vPosition = position;
float waveOffset = -u_y_offset * u_y_offset_wave_multiplier;
float colorOffset = -u_y_offset * u_y_offset_color_multiplier;
float flowOffset = -u_y_offset * u_y_offset_flow_multiplier;
v_displacement_amount = cnoise( vec3(
u_wave_frequency_x * position.x + u_time,
u_wave_frequency_y * (position.y + waveOffset) + u_time,
u_time
));
vec2 baseUv = vUv;
baseUv.y += flowOffset / u_plane_height;
vec2 flowUv = baseUv;
if (u_flow_enabled > 0.5) {
if (u_flow_ease > 0.0 || u_flow_distortion_a > 0.0) {
vec2 ppp = -1.0 + 2.0 * baseUv;
ppp += 0.1 * cos((1.5 * u_flow_scale) * ppp.yx + 1.1 * u_time + vec2(0.1, 1.1));
ppp += 0.1 * cos((2.3 * u_flow_scale) * ppp.yx + 1.3 * u_time + vec2(3.2, 3.4));
ppp += 0.1 * cos((2.2 * u_flow_scale) * ppp.yx + 1.7 * u_time + vec2(1.8, 5.2));
ppp += u_flow_distortion_a * cos((u_flow_distortion_b * u_flow_scale) * ppp.yx + 1.4 * u_time + vec2(6.3, 3.9));
float r = length(ppp);
flowUv = mix(baseUv, vec2(baseUv.x * (1.0 - u_flow_ease) + r * u_flow_ease, baseUv.y), u_flow_ease);
}
}
vFlowUv = flowUv;
vec3 color = u_colors[0].color;
vec3 distortedPos = position;
if (u_flat_shading < 0.5) {
if (u_flow_enabled > 0.5) {
if (u_flow_ease > 0.0 || u_flow_distortion_a > 0.0) {
vec3 ppp = position / 25.0;
ppp.xyz += 0.1 * cos((1.5 * u_flow_scale) * ppp.yxz + 1.1 * u_time + vec3(0.1, 1.1, 2.1));
ppp.xyz += 0.1 * cos((2.3 * u_flow_scale) * ppp.zxy + 1.3 * u_time + vec3(3.2, 3.4, 1.2));
ppp.xyz += 0.1 * cos((2.2 * u_flow_scale) * ppp.yxz + 1.7 * u_time + vec3(1.8, 5.2, 3.1));
ppp.xyz += u_flow_distortion_a * cos((u_flow_distortion_b * u_flow_scale) * ppp.zxy + 1.4 * u_time + vec3(6.3, 3.9, 4.5));
float r = length(ppp);
distortedPos = mix(position, vec3(
position.x * (1.0 - u_flow_ease) + r * u_flow_ease * 25.0,
position.y,
position.z * (1.0 - u_flow_ease) + r * u_flow_ease * 25.0
), u_flow_ease);
}
}
}
vec3 noise_cord;
if (u_flat_shading < 0.5) {
noise_cord = vec3(distortedPos.x / 50.0, (distortedPos.y + colorOffset) / 50.0, distortedPos.z / 50.0);
} else {
vec2 adjustedUv = flowUv;
adjustedUv.y += colorOffset / u_plane_height;
noise_cord = vec3(adjustedUv, 0.0);
}
const float minNoise = .0;
const float maxNoise = .9;
for (int i = 1; i < 6; i++) {
if (i < u_colors_count) {
if (u_colors[i].is_active > 0.5) {
float noiseFlow = (1. + float(i)) / 30.;
float noiseSpeed = (1. + float(i)) * 0.11;
float noiseSeed = 13. + float(i) * 7.;
float noise_z = u_time * noiseSpeed;
if (u_flat_shading < 0.5) {
noise_z = noise_cord.z * u_color_pressure.x * u_color_pressure.x + u_time * noiseSpeed;
}
float noise = snoise(
vec3(
noise_cord.x * u_color_pressure.x * u_color_pressure.x + u_time * noiseFlow * 2.,
noise_cord.y * u_color_pressure.y * u_color_pressure.y,
noise_z
) + noiseSeed
) - (.1 * float(i)) + (.5 * u_color_blending);
noise = clamp(noise, minNoise, maxNoise + float(i) * 0.02);
color = mix(color, u_colors[i].color, smoothstep(0.0, u_color_blending, noise));
}
}
}
v_color = color;
vec3 newPosition = position + normal * v_displacement_amount * u_wave_amplitude;
vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
vViewPosition = mvPosition.xyz;
vNormal = normalize((modelViewMatrix * vec4(normal, 0.0)).xyz);
gl_Position = projectionMatrix * mvPosition;
v_new_position = gl_Position;
}`,ve=`float random(vec2 p) {
return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
}
float fbm(vec3 x) {
float value = 0.0;
float amplitude = 0.5;
float frequency = 1.0;
for (int i = 0; i < 2; i++) {
value += amplitude * snoise(x * frequency);
frequency *= 2.0;
amplitude *= 0.5;
}
return value;
}
vec3 hsl2rgb(float h, float s, float l) {
vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}
void main() {
vec2 finalUv = vFlowUv;
vec3 baseColor;
float texAlpha = 1.0;
if (u_enable_procedural_texture > 0.5) {
if (u_flat_shading < 0.5) {
float parallaxFactor = 0.25;
float scrollOffset = (u_y_offset * u_y_offset_color_multiplier) * parallaxFactor;
vec3 scrolledPos = vPosition;
scrolledPos.y -= scrollOffset;
vec3 p = (scrolledPos * 1.5) / 50.0;
vec2 uvX = p.yz + vec2(0.5);
vec2 uvY = p.zx + vec2(0.5);
vec2 uvZ = p.xy + vec2(0.5);
vec4 colX = texture2D(u_procedural_texture, uvX);
vec4 colY = texture2D(u_procedural_texture, uvY);
vec4 colZ = texture2D(u_procedural_texture, uvZ);
vec3 n = normalize(vNormal);
vec3 blendWeights = abs(n);
blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z + 0.0001);
vec4 texSample = colX * blendWeights.x + colY * blendWeights.y + colZ * blendWeights.z;
baseColor = texSample.rgb;
if (u_transparent_texture_void > 0.5) {
texAlpha = texSample.a;
}
} else {
vec2 ppp = -1.0 + 2.0 * finalUv;
ppp += 0.1 * cos((1.5 * u_flow_scale) * ppp.yx + 1.1 * u_time + vec2(0.1, 1.1));
ppp += 0.1 * cos((2.3 * u_flow_scale) * ppp.yx + 1.3 * u_time + vec2(3.2, 3.4));
ppp += 0.1 * cos((2.2 * u_flow_scale) * ppp.yx + 1.7 * u_time + vec2(1.8, 5.2));
ppp += u_flow_distortion_a * cos((u_flow_distortion_b * u_flow_scale) * ppp.yx + 1.4 * u_time + vec2(6.3, 3.9));
float r = length(ppp);
float vx = (finalUv.x * u_texture_ease) + (r * (1.0 - u_texture_ease));
float vy = (finalUv.y * u_texture_ease) + (0.0 * (1.0 - u_texture_ease));
vec2 texUv = vec2(vx, vy);
float parallaxFactor = 0.25;
texUv.y -= (u_y_offset * u_y_offset_color_multiplier / u_plane_height) * parallaxFactor;
texUv *= 1.5;
vec4 texSample = texture2D(u_procedural_texture, texUv);
baseColor = texSample.rgb;
if (u_transparent_texture_void > 0.5) {
texAlpha = texSample.a;
}
}
} else {
baseColor = v_color;
}
vec3 color = baseColor;
if (u_domain_warp_enabled > 0.5) {
vec3 p;
if (u_flat_shading < 0.5) {
p = vec3((vPosition / 50.0 + vec3(0.5)) * u_domain_warp_scale);
p.z += u_time * 0.15;
} else {
p = vec3(finalUv * u_domain_warp_scale, u_time * 0.15);
}
vec2 q = vec2(fbm(p), fbm(p + vec3(5.2, 1.3, 0.0)));
float f = fbm(p + vec3(4.0 * q, 0.0));
vec3 warpColor = color * (1.0 + f * 0.8 * u_domain_warp_intensity);
float pattern = clamp(f * f * f + 0.6 * f * f + 0.5 * f, 0.0, 1.0);
color = mix(color, warpColor * (0.6 + pattern * 0.8), u_domain_warp_intensity * 0.7);
}
vec3 normal = normalize(vNormal);
vec3 viewDir = vec3(0.0, 0.0, 1.0);
float ndotv = dot(normal, viewDir);
if (u_shape_type > 0.5 && u_shape_type < 3.5) {
if (ndotv < 0.0) {
discard;
}
} else {
if (ndotv < 0.0) {
normal = -normal;
ndotv = -ndotv;
}
}
vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
float diffuse = max(dot(normal, lightDir), 0.0);
vec3 halfDir = normalize(lightDir + viewDir);
float specular = pow(max(dot(normal, halfDir), 0.0), 32.0);
if (u_flat_shading > 0.5) {
color += v_displacement_amount * u_highlights;
float heightShadow = 1.0 - v_displacement_amount;
color -= heightShadow * heightShadow * u_shadows;
} else {
color += specular * u_highlights;
color += v_displacement_amount * u_highlights * 0.5;
float heightShadow = 1.0 - v_displacement_amount;
color -= heightShadow * heightShadow * u_shadows * 0.5;
color -= (1.0 - diffuse) * u_shadows * 0.5;
}
color = saturation(color, 1.0 + u_saturation);
color = color * u_brightness;
if (u_iridescence_enabled > 0.5) {
float hue = fract(v_displacement_amount * 0.5 + 0.5 + u_time * u_iridescence_speed * 0.05);
vec3 iriColor = hsl2rgb(hue, 0.8, 0.6);
color = mix(color, iriColor, u_iridescence_intensity * abs(v_displacement_amount) * 0.6);
}
if (u_fresnel_enabled > 0.5) {
float slope = 1.0 - abs(v_displacement_amount);
float fresnel = pow(max(slope, 0.0), u_fresnel_power);
color += u_fresnel_color * fresnel * u_fresnel_intensity;
}
if (u_vignette_intensity > 0.0) {
vec2 vigUv = vUv;
if (u_flat_shading < 0.5) {
vigUv = (v_new_position.xy / v_new_position.w) * 0.5 + vec2(0.5);
}
float dist = length(vigUv - vec2(0.5));
float vig = smoothstep(u_vignette_radius, u_vignette_radius * 0.3, dist);
color *= mix(1.0, vig, u_vignette_intensity);
}
if (u_bloom_intensity > 0.0) {
float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
float bloomMask = smoothstep(u_bloom_threshold, 1.0, luma);
color += color * bloomMask * u_bloom_intensity;
}
if (u_chromatic_aberration > 0.0) {
float caAmount = u_chromatic_aberration * 0.008;
vec2 caUv = vUv;
if (u_flat_shading < 0.5) {
caUv = (v_new_position.xy / v_new_position.w) * 0.5 + vec2(0.5);
}
float dist = length(caUv - vec2(0.5));
float rShift = v_displacement_amount + caAmount * dist;
float bShift = v_displacement_amount - caAmount * dist;
color.r *= 1.0 + rShift * caAmount * 10.0;
color.b *= 1.0 - bShift * caAmount * 10.0;
}
float grain = 0.0;
if (u_grain_intensity > 0.0) {
vec2 noiseCoords = gl_FragCoord.xy / u_grain_scale;
if (u_grain_speed != 0.0 || u_flat_shading > 0.5) {
grain = fbm(vec3(noiseCoords, u_time * u_grain_speed));
} else {
grain = random(noiseCoords) - 0.5;
}
grain = grain * 0.5 + 0.5;
grain -= 0.5;
grain = (grain > u_grain_sparsity) ? grain : 0.0;
grain *= u_grain_intensity;
}
color += vec3(grain);
float edgeAlpha = 1.0;
if (u_silhouette_fade > 0.0 && u_flat_shading < 0.5) {
edgeAlpha = smoothstep(0.0, u_silhouette_fade, ndotv);
}
if (u_shape_type == 3.0) {
float vFade = smoothstep(0.0, u_cylinder_fade, vUv.y) * smoothstep(1.0, 1.0 - u_cylinder_fade, vUv.y);
edgeAlpha *= vFade;
} else if (u_shape_type == 4.0) {
float uFade = smoothstep(0.0, u_ribbon_fade, vUv.x) * smoothstep(1.0, 1.0 - u_ribbon_fade, vUv.x);
float vFade = smoothstep(0.0, u_ribbon_fade, vUv.y) * smoothstep(1.0, 1.0 - u_ribbon_fade, vUv.y);
edgeAlpha *= uFade * vFade;
}
edgeAlpha *= texAlpha;
gl_FragColor = vec4(color, edgeAlpha);
}`;function ge(){return`precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;
varying vec2 vFlowUv;
varying vec4 v_new_position;
varying vec3 v_color;
varying float v_displacement_amount;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_color_pressure;
uniform float u_wave_frequency_x;
uniform float u_wave_frequency_y;
uniform float u_wave_amplitude;
uniform float u_plane_width;
uniform float u_plane_height;
uniform float u_color_blending;
uniform int u_colors_count;
struct ColorStop {
float is_active;
vec3 color;
float influence;
};
uniform ColorStop u_colors[6];
uniform float u_y_offset;
uniform float u_y_offset_wave_multiplier;
uniform float u_y_offset_color_multiplier;
uniform float u_y_offset_flow_multiplier;
uniform float u_flow_distortion_a;
uniform float u_flow_distortion_b;
uniform float u_flow_scale;
uniform float u_flow_ease;
uniform float u_flow_enabled;
uniform float u_fresnel_enabled;
uniform float u_fresnel_power;
uniform float u_fresnel_intensity;
uniform vec3 u_fresnel_color;
uniform float u_shape_type;
uniform float u_flat_shading;`}function ye(){return`precision highp float;
varying vec2 vUv;
varying vec2 vFlowUv;
varying vec4 v_new_position;
varying vec3 v_color;
varying float v_displacement_amount;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_plane_height;
uniform float u_shadows;
uniform float u_highlights;
uniform float u_saturation;
uniform float u_brightness;
uniform float u_grain_intensity;
uniform float u_grain_sparsity;
uniform float u_grain_scale;
uniform float u_grain_speed;
uniform float u_y_offset;
uniform float u_y_offset_color_multiplier;
uniform float u_flow_distortion_a;
uniform float u_flow_distortion_b;
uniform float u_flow_scale;
uniform sampler2D u_procedural_texture;
uniform float u_enable_procedural_texture;
uniform float u_texture_ease;
uniform float u_domain_warp_enabled;
uniform float u_domain_warp_intensity;
uniform float u_domain_warp_scale;
uniform float u_vignette_intensity;
uniform float u_vignette_radius;
uniform float u_fresnel_enabled;
uniform float u_fresnel_power;
uniform float u_fresnel_intensity;
uniform vec3 u_fresnel_color;
uniform float u_iridescence_enabled;
uniform float u_iridescence_intensity;
uniform float u_iridescence_speed;
uniform float u_bloom_intensity;
uniform float u_bloom_threshold;
uniform float u_chromatic_aberration;
uniform float u_shape_type;
uniform float u_transparent_texture_void;
uniform float u_silhouette_fade;
uniform float u_cylinder_fade;
uniform float u_ribbon_fade;
uniform float u_flat_shading;`}function te(){return`vec4 permute(vec4 x) {
return floor(fract(sin(x) * 43758.5453123) * 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t) {
return t*t*t*(t*(t*6.0-15.0)+10.0);
}
float snoise(vec3 v) {
const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
vec3 i = floor(v + dot(v, C.yyy) );
vec3 x0 = v - i + dot(i, C.xxx) ;
vec3 g = step(x0.yzx, x0.xyz);
vec3 l = 1.0 - g;
vec3 i1 = min( g.xyz, l.zxy );
vec3 i2 = max( g.xyz, l.zxy );
vec3 x1 = x0 - i1 + C.xxx;
vec3 x2 = x0 - i2 + C.yyy;
vec3 x3 = x0 - D.yyy;
vec4 p = permute( permute( permute(
i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
+ i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
float n_ = 0.142857142857;
vec3 ns = n_ * D.wyz - D.xzx;
vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
vec4 x_ = floor(j * ns.z);
vec4 y_ = floor(j - 7.0 * x_ );
vec4 x = x_ *ns.x + ns.yyyy;
vec4 y = y_ *ns.x + ns.yyyy;
vec4 h = 1.0 - abs(x) - abs(y);
vec4 b0 = vec4( x.xy, y.xy );
vec4 b1 = vec4( x.zw, y.zw );
vec4 s0 = floor(b0)*2.0 + 1.0;
vec4 s1 = floor(b1)*2.0 + 1.0;
vec4 sh = -step(h, vec4(0.0));
vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
vec3 p0 = vec3(a0.xy,h.x);
vec3 p1 = vec3(a0.zw,h.y);
vec3 p2 = vec3(a1.xy,h.z);
vec3 p3 = vec3(a1.zw,h.w);
vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
p0 *= norm.x;
p1 *= norm.y;
p2 *= norm.z;
p3 *= norm.w;
vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
m = m * m;
return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
dot(p2,x2), dot(p3,x3) ) );
}
float cnoise(vec3 P)
{
vec3 Pi0 = floor(P);
vec3 Pi1 = Pi0 + vec3(1.0);
vec3 Pf0 = fract(P);
vec3 Pf1 = Pf0 - vec3(1.0);
vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
vec4 iy = vec4(Pi0.yy, Pi1.yy);
vec4 iz0 = Pi0.zzzz;
vec4 iz1 = Pi1.zzzz;
vec4 ixy = permute(permute(ix) + iy);
vec4 ixy0 = permute(ixy + iz0);
vec4 ixy1 = permute(ixy + iz1);
vec4 gx0 = ixy0 * (1.0 / 7.0);
vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
gx0 = fract(gx0);
vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
vec4 sz0 = step(gz0, vec4(0.0));
gx0 -= sz0 * (step(0.0, gx0) - 0.5);
gy0 -= sz0 * (step(0.0, gy0) - 0.5);
vec4 gx1 = ixy1 * (1.0 / 7.0);
vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
gx1 = fract(gx1);
vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
vec4 sz1 = step(gz1, vec4(0.0));
gx1 -= sz1 * (step(0.0, gx1) - 0.5);
gy1 -= sz1 * (step(0.0, gy1) - 0.5);
vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
g000 *= norm0.x;
g010 *= norm0.y;
g100 *= norm0.z;
g110 *= norm0.w;
vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
g001 *= norm1.x;
g011 *= norm1.y;
g101 *= norm1.z;
g111 *= norm1.w;
float n000 = dot(g000, Pf0);
float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
float n111 = dot(g111, Pf1);
vec3 fade_xyz = fade(Pf0);
vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
return 2.2 * n_xyz;
}`}function ie(){return`vec3 saturation(vec3 rgb, float adjustment) {
const vec3 W = vec3(0.2125, 0.7154, 0.0721);
vec3 intensity = vec3(dot(rgb, W));
return mix(intensity, rgb, adjustment);
}`}class oe{elements;constructor(){this.elements=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}identity(){const e=this.elements;return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}translate(e,i,s){return this.elements[12]+=this.elements[0]*e+this.elements[4]*i+this.elements[8]*s,this.elements[13]+=this.elements[1]*e+this.elements[5]*i+this.elements[9]*s,this.elements[14]+=this.elements[2]*e+this.elements[6]*i+this.elements[10]*s,this.elements[15]+=this.elements[3]*e+this.elements[7]*i+this.elements[11]*s,this}rotateX(e){const i=Math.cos(e),s=Math.sin(e),o=this.elements[4],t=this.elements[5],l=this.elements[6],r=this.elements[7],u=this.elements[8],c=this.elements[9],w=this.elements[10],v=this.elements[11];return this.elements[4]=i*o+s*u,this.elements[5]=i*t+s*c,this.elements[6]=i*l+s*w,this.elements[7]=i*r+s*v,this.elements[8]=i*u-s*o,this.elements[9]=i*c-s*t,this.elements[10]=i*w-s*l,this.elements[11]=i*v-s*r,this}rotateY(e){const i=Math.cos(e),s=Math.sin(e),o=this.elements[0],t=this.elements[1],l=this.elements[2],r=this.elements[3],u=this.elements[8],c=this.elements[9],w=this.elements[10],v=this.elements[11];return this.elements[0]=i*o-s*u,this.elements[1]=i*t-s*c,this.elements[2]=i*l-s*w,this.elements[3]=i*r-s*v,this.elements[8]=s*o+i*u,this.elements[9]=s*t+i*c,this.elements[10]=s*l+i*w,this.elements[11]=s*r+i*v,this}rotateZ(e){const i=Math.cos(e),s=Math.sin(e),o=this.elements[0],t=this.elements[1],l=this.elements[2],r=this.elements[3],u=this.elements[4],c=this.elements[5],w=this.elements[6],v=this.elements[7];return this.elements[0]=i*o+s*u,this.elements[1]=i*t+s*c,this.elements[2]=i*l+s*w,this.elements[3]=i*r+s*v,this.elements[4]=-s*o+i*u,this.elements[5]=-s*t+i*c,this.elements[6]=-s*l+i*w,this.elements[7]=-s*r+i*v,this}}class xe{left;right;top;bottom;near;far;position;projectionMatrix;zoom;constructor(e,i,s,o,t,l){this.left=e,this.right=i,this.top=s,this.bottom=o,this.near=t,this.far=l,this.position=[0,0,0],this.zoom=1,this.projectionMatrix=new oe,this.updateProjectionMatrix()}updateProjectionMatrix(){const e=1/(this.right-this.left),i=1/(this.top-this.bottom),s=1/(this.far-this.near),o=(this.right+this.left)*e,t=(this.top+this.bottom)*i,l=(this.far+this.near)*s;this.projectionMatrix.elements=new Float32Array([2*e,0,0,0,0,2*i,0,0,0,0,-2*s,0,-o,-t,-l,1])}}function Z(m,e,i,s=50,o=50,t="plane",l=1){m.zoom=l;const r=e/i;if(t==="plane"){const w=e*i/1e6*s*o/1.5,v=Math.sqrt(w*r),f=w/v;let y=-s/2,a=Math.min((y+v)/1.5,s/2),h=o/4,R=Math.max((h-f)/2,-o/4);if(r<1){const d=r;y=y*d,a=a*d;const b=1.05;y=y*b,a=a*b,h=h*b,R=R*b}m.left=y,m.right=a,m.top=h,m.bottom=R}else{let u=25;if(t==="sphere"?u=30:t==="torus"?u=35:t==="cylinder"&&(u=30),r>=1)m.left=-u*r,m.right=u*r,m.top=u,m.bottom=-u;else{m.left=-u,m.right=u,m.top=u/r,m.bottom=-u/r;const c=1.05;m.left*=c,m.right*=c,m.top*=c,m.bottom*=c}}m.left/=l,m.right/=l,m.top/=l,m.bottom/=l,m.near=-100,m.far=1e3,m.updateProjectionMatrix()}function re(m,e,i,s){const o=m/2,t=e/2,l=Math.floor(i),r=Math.floor(s),u=l+1,c=r+1,w=m/l,v=e/r,f=[],y=[],a=[],h=[];for(let b=0;b<c;b++){const A=b*v-t;for(let x=0;x<u;x++){const _=x*w-o;y.push(_,-A,0),a.push(0,0,1),h.push(x/l),h.push(1-b/r)}}for(let b=0;b<r;b++)for(let A=0;A<l;A++){const x=A+u*b,_=A+u*(b+1),T=A+1+u*(b+1),F=A+1+u*b;f.push(x,_,F),f.push(_,T,F)}const R=y.length/3>65535,d=[];for(let b=0;b<f.length;b+=3){const A=f[b],x=f[b+1],_=f[b+2];d.push(A,x,x,_,_,A)}return{position:new Float32Array(y),normal:new Float32Array(a),uv:new Float32Array(h),index:R?new Uint32Array(f):new Uint16Array(f),wireframeIndex:R?new Uint32Array(d):new Uint16Array(d)}}function se(m,e,i){const s=[],o=[],t=[],l=[],r=Math.floor(e),u=Math.floor(i);for(let v=0;v<=u;v++){const f=v/u,y=f*Math.PI;for(let a=0;a<=r;a++){const h=a/r,R=h*Math.PI*2,d=-m*Math.sin(y)*Math.cos(R),b=m*Math.cos(y),A=m*Math.sin(y)*Math.sin(R);s.push(d,b,A);const x=Math.sqrt(d*d+b*b+A*A);o.push(d/x,b/x,A/x),t.push(h,1-f)}}for(let v=0;v<u;v++)for(let f=0;f<r;f++){const y=f+(r+1)*v,a=f+(r+1)*(v+1),h=f+1+(r+1)*(v+1),R=f+1+(r+1)*v;l.push(y,a,R),l.push(a,h,R)}const c=s.length/3>65535,w=[];for(let v=0;v<l.length;v+=3){const f=l[v],y=l[v+1],a=l[v+2];w.push(f,y,y,a,a,f)}return{position:new Float32Array(s),normal:new Float32Array(o),uv:new Float32Array(t),index:c?new Uint32Array(l):new Uint16Array(l),wireframeIndex:c?new Uint32Array(w):new Uint16Array(w)}}function ne(m,e,i,s){const o=[],t=[],l=[],r=[],u=Math.floor(i),c=Math.floor(s);for(let f=0;f<=u;f++){const y=f/u*Math.PI*2;for(let a=0;a<=c;a++){const h=a/c*Math.PI*2,R=(m+e*Math.cos(y))*Math.cos(h),d=(m+e*Math.cos(y))*Math.sin(h),b=e*Math.sin(y);o.push(R,d,b);const A=m*Math.cos(h),x=m*Math.sin(h),_=R-A,T=d-x,F=b,g=Math.sqrt(_*_+T*T+F*F);t.push(_/g,T/g,F/g),l.push(a/c,f/u)}}for(let f=1;f<=u;f++)for(let y=1;y<=c;y++){const a=(c+1)*f+y-1,h=(c+1)*(f-1)+y-1,R=(c+1)*(f-1)+y,d=(c+1)*f+y;r.push(a,h,d),r.push(h,R,d)}const w=o.length/3>65535,v=[];for(let f=0;f<r.length;f+=3){const y=r[f],a=r[f+1],h=r[f+2];v.push(y,a,a,h,h,y)}return{position:new Float32Array(o),normal:new Float32Array(t),uv:new Float32Array(l),index:w?new Uint32Array(r):new Uint16Array(r),wireframeIndex:w?new Uint32Array(v):new Uint16Array(v)}}function ae(m,e,i,s,o){const t=[],l=[],r=[],u=[],c=Math.floor(s),w=Math.floor(o),v=i/2;for(let a=0;a<=w;a++){const h=a/w,R=h*i-v,d=h*(e-m)+m;for(let b=0;b<=c;b++){const A=b/c,x=A*Math.PI*2,_=Math.sin(x),T=Math.cos(x);t.push(d*_,-R,d*T),l.push(_,0,T),r.push(A,1-h)}}for(let a=0;a<w;a++)for(let h=0;h<c;h++){const R=h+(c+1)*a,d=h+(c+1)*(a+1),b=h+1+(c+1)*(a+1),A=h+1+(c+1)*a;u.push(R,d,A),u.push(d,b,A)}const f=t.length/3>65535,y=[];for(let a=0;a<u.length;a+=3){const h=u[a],R=u[a+1],d=u[a+2];y.push(h,R,R,d,d,h)}return{position:new Float32Array(t),normal:new Float32Array(l),uv:new Float32Array(r),index:f?new Uint32Array(u):new Uint16Array(u),wireframeIndex:f?new Uint32Array(y):new Uint16Array(y)}}function le(m,e,i,s,o,t){const l=m/2,r=e/2,u=Math.floor(i),c=Math.floor(s),w=u+1,v=c+1,f=m/u,y=e/c,a=[],h=[],R=[],d=[];for(let x=0;x<v;x++){const _=x*y-r;for(let T=0;T<w;T++){const F=T*f-l;let g=F,S=_,B=0,E=0,P=0,U=1;if(Math.abs(o)>.001){const z=m/o,M=F/z;g=z*Math.sin(M),B=z*(1-Math.cos(M)),E=Math.sin(M),U=Math.cos(M)}if(Math.abs(t)>.001){const z=_/e*t,M=Math.cos(z),C=Math.sin(z),I=g*M-B*C,V=g*C+B*M;g=I,B=V;const D=E*M-U*C,W=E*C+U*M;E=D,U=W}a.push(g,-S,B),h.push(E,P,U),R.push(T/u),R.push(1-x/c)}}for(let x=0;x<c;x++)for(let _=0;_<u;_++){const T=_+w*x,F=_+w*(x+1),g=_+1+w*(x+1),S=_+1+w*x;d.push(T,F,S),d.push(F,g,S)}const b=a.length/3>65535,A=[];for(let x=0;x<d.length;x+=3){const _=d[x],T=d[x+1],F=d[x+2];A.push(_,T,T,F,F,_)}return{position:new Float32Array(a),normal:new Float32Array(h),uv:new Float32Array(R),index:b?new Uint32Array(d):new Uint16Array(d),wireframeIndex:b?new Uint32Array(A):new Uint16Array(A)}}const be={kty:"EC",crv:"P-256",x:"n9A9jNvLNR6QJaPP4ZdpbXtPFz3ASUfeeQm11Jd53Rg",y:"EoG5ezJ3hr4c62JjpsyabotdFeU-A1LyH-qHyabnKc0",key_ops:["verify"],ext:!0};function ue(m){let e=m.replace(/-/g,"+").replace(/_/g,"/");for(;e.length%4!==0;)e+="=";const i=atob(e),s=new Uint8Array(i.length);for(let o=0;o<i.length;o++)s[o]=i.charCodeAt(o);return s}function we(m){if(typeof window>"u"||!window.location)return!0;const e=window.location.hostname.toLowerCase(),i=m.toLowerCase();return!!(e==="localhost"||e==="127.0.0.1"||e==="0.0.0.0"||e==="[::1]"||e.endsWith(".localhost")||e===i||e.endsWith("."+i))}async function Re(m){try{if(typeof crypto>"u"||!crypto.subtle||typeof crypto.subtle.verify!="function")return{valid:!1,reason:"Web Crypto API not available (page must be served over HTTPS)"};const e=m.trim();if(!e.startsWith("NEAT-"))return{valid:!1,reason:'Key must start with "NEAT-" prefix'};const i=e.slice(5),s=i.indexOf(".");if(s===-1)return{valid:!1,reason:"Invalid key format: missing separator"};const o=i.slice(0,s),t=i.slice(s+1);if(!o||!t)return{valid:!1,reason:"Invalid key format: empty payload or signature"};const r=ue(o).buffer.slice(0),u=new TextDecoder().decode(r),c=JSON.parse(u);if(!c.domain||typeof c.domain!="string")return{valid:!1,reason:"Invalid payload: missing domain"};if(!we(c.domain)){const a=typeof window<"u"&&window.location?window.location.hostname:"unknown";return{valid:!1,reason:`Domain mismatch: key is for "${c.domain}" but current hostname is "${a}"`}}const v=ue(t).buffer.slice(0),f=await crypto.subtle.importKey("jwk",be,{name:"ECDSA",namedCurve:"P-256"},!1,["verify"]);return await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},f,v,r)?{valid:!0,payload:c}:{valid:!1,reason:"Signature verification failed"}}catch(e){return{valid:!1,reason:`Unexpected error: ${e instanceof Error?e.message:String(e)}`}}}const Ae="1.0.2";function _e(){console.info(`%c\u{1F308} Neat Gradients v${Ae}%c

Licensed under MIT + The Commons Clause.
Free for personal and commercial use.
Selling this software or its derivatives is strictly prohibited.
Get a license key to remove the watermark and this message: https://neat.firecms.co`,"font-weight: bold; font-size: 14px; color: #FF5772;","color: inherit;")}const Y=50,N=80,$=6,Se=[["speed","_speed",20,1/20,"u"],["horizontalPressure","_horizontalPressure",4,1/4,"u"],["verticalPressure","_verticalPressure",4,1/4,"u"],["waveFrequencyX","_waveFrequencyX",1/.04,.04,"u"],["waveFrequencyY","_waveFrequencyY",1/.04,.04,"u"],["waveAmplitude","_waveAmplitude",1/.75,.75,"u"],["highlights","_highlights",100,1/100,"u"],["shadows","_shadows",100,1/100,"u"],["colorSaturation","_saturation",10,1/10,"u"],["colorBlending","_colorBlending",10,1/10,"u"],["yOffsetWaveMultiplier","_yOffsetWaveMultiplier",1e3,1/1e3,"u"],["yOffsetColorMultiplier","_yOffsetColorMultiplier",1e3,1/1e3,"u"],["yOffsetFlowMultiplier","_yOffsetFlowMultiplier",1e3,1/1e3,"u"],["colorBrightness","_brightness",1,1,"u"],["grainIntensity","_grainIntensity",1,1,"u"],["grainSparsity","_grainSparsity",1,1,"u"],["grainSpeed","_grainSpeed",1,1,"u"],["wireframe","_wireframe",1,1,"u"],["backgroundAlpha","_backgroundAlpha",1,1,"u"],["flowDistortionA","_flowDistortionA",1,1,"u"],["flowDistortionB","_flowDistortionB",1,1,"u"],["flowScale","_flowScale",1,1,"u"],["flowEase","_flowEase",1,1,"u"],["flowEnabled","_flowEnabled",1,1,"u"],["textureEase","_textureEase",1,1,"u"],["silhouetteFade","_silhouetteFade",1,1,"u"],["cylinderFade","_cylinderFade",1,1,"u"],["ribbonFade","_ribbonFade",1,1,"u"],["flatShading","_flatShading",1,1,"u"],["domainWarpEnabled","_domainWarpEnabled",1,1,"u"],["domainWarpIntensity","_domainWarpIntensity",1,1,"u"],["domainWarpScale","_domainWarpScale",1,1,"u"],["vignetteIntensity","_vignetteIntensity",1,1,"u"],["vignetteRadius","_vignetteRadius",1,1,"u"],["fresnelEnabled","_fresnelEnabled",1,1,"u"],["fresnelPower","_fresnelPower",1,1,"u"],["fresnelIntensity","_fresnelIntensity",1,1,"u"],["iridescenceEnabled","_iridescenceEnabled",1,1,"u"],["iridescenceIntensity","_iridescenceIntensity",1,1,"u"],["iridescenceSpeed","_iridescenceSpeed",1,1,"u"],["bloomIntensity","_bloomIntensity",1,1,"u"],["bloomThreshold","_bloomThreshold",1,1,"u"],["chromaticAberration","_chromaticAberration",1,1,"u"],["shapeRotationX","_shapeRotationX",1,1,"u"],["shapeRotationY","_shapeRotationY",1,1,"u"],["shapeRotationZ","_shapeRotationZ",1,1,"u"],["shapeAutoRotateSpeedX","_shapeAutoRotateSpeedX",1,1,"u"],["shapeAutoRotateSpeedY","_shapeAutoRotateSpeedY",1,1,"u"],["cameraX","_cameraX",1,1,"u"],["cameraY","_cameraY",1,1,"u"],["cameraZ","_cameraZ",1,1,"u"],["cameraRotationX","_cameraRotationX",1,1,"u"],["cameraRotationY","_cameraRotationY",1,1,"u"],["cameraRotationZ","_cameraRotationZ",1,1,"u"],["textureVoidLikelihood","_textureVoidLikelihood",1,1,"t"],["textureVoidWidthMin","_textureVoidWidthMin",1,1,"t"],["textureVoidWidthMax","_textureVoidWidthMax",1,1,"t"],["textureBandDensity","_textureBandDensity",1,1,"t"],["textureColorBlending","_textureColorBlending",1,1,"t"],["textureSeed","_textureSeed",1,1,"t"],["transparentTextureVoid","_transparentTextureVoid",1,1,"t"],["proceduralBackgroundColor","_proceduralBackgroundColor",1,1,"t"],["textureShapeTriangles","_textureShapeTriangles",1,1,"t"],["textureShapeCircles","_textureShapeCircles",1,1,"t"],["textureShapeBars","_textureShapeBars",1,1,"t"],["textureShapeSquiggles","_textureShapeSquiggles",1,1,"t"],["sphereRadius","_sphereRadius",1,1,"g"],["torusRadius","_torusRadius",1,1,"g"],["torusTube","_torusTube",1,1,"g"],["cylinderRadius","_cylinderRadius",1,1,"g"],["cylinderHeight","_cylinderHeight",1,1,"g"],["planeBend","_planeBend",1,1,"g"],["planeTwist","_planeTwist",1,1,"g"]];class ce{_ref;_licensed=!1;_antialias=!1;_speed=-1;_horizontalPressure=-1;_verticalPressure=-1;_waveFrequencyX=-1;_waveFrequencyY=-1;_waveAmplitude=-1;_shadows=-1;_highlights=-1;_saturation=-1;_brightness=-1;_grainScale=-1;_grainIntensity=-1;_grainSparsity=-1;_grainSpeed=-1;_colorBlending=-1;_resolution=1;_colors=[];_wireframe=!1;_backgroundColor="#FFFFFF";_backgroundColorRgb=[1,1,1];_backgroundAlpha=1;_flowDistortionA=0;_flowDistortionB=0;_flowScale=1;_flowEase=0;_flowEnabled=!0;glState;_enableProceduralTexture=!1;_textureVoidLikelihood=.45;_textureVoidWidthMin=200;_textureVoidWidthMax=486;_textureBandDensity=2.15;_textureColorBlending=.01;_textureSeed=333;_textureEase=.5;_transparentTextureVoid=!1;_domainWarpEnabled=!1;_domainWarpIntensity=.5;_domainWarpScale=1;_vignetteIntensity=.5;_vignetteRadius=.8;_fresnelEnabled=!1;_fresnelPower=2;_fresnelIntensity=.5;_fresnelColor="#FFFFFF";_fresnelColorRgb=[1,1,1];_iridescenceEnabled=!1;_iridescenceIntensity=.5;_iridescenceSpeed=1;_bloomIntensity=0;_bloomThreshold=.7;_chromaticAberration=0;_silhouetteFade=.25;_cylinderFade=.08;_ribbonFade=.05;_flatShading=!0;_shapeType="plane";_shapeRotationX=0;_shapeRotationY=0;_shapeRotationZ=0;_shapeAutoRotateSpeedX=0;_shapeAutoRotateSpeedY=0;_sphereRadius=15;_torusRadius=15;_torusTube=5;_cylinderRadius=10;_cylinderHeight=40;_planeBend=0;_planeTwist=0;_cameraLock=!1;_cameraX=0;_cameraY=0;_cameraZ=0;_cameraRotationX=0;_cameraRotationY=0;_cameraRotationZ=0;_cameraZoom=1;_proceduralTexture=null;_proceduralBackgroundColor="#000000";_textureShapeTriangles=20;_textureShapeCircles=15;_textureShapeBars=15;_textureShapeSquiggles=10;requestRef=-1;sizeObserver;_currentCursor="";_initialized=!1;_cachedColorRgb=[];_yOffset=0;_yOffsetWaveMultiplier=.004;_yOffsetColorMultiplier=.004;_yOffsetFlowMultiplier=.004;_sourceCanvas=null;_sourceCtx=null;_maskedCanvas=null;_maskedCtx=null;_resizeTimeoutId=null;_textureNeedsUpdate=!1;_colorsChanged=!0;_uniformsDirty=!0;_textureDirty=!0;_yOffsetDirty=!1;_modelViewMatrix=new oe;_isVisible=!0;_visibilityObserver=null;_visibilityHandler=null;_watermarkProgram=null;_watermarkTexture=null;_watermarkBuffer=null;_watermarkTexCoordBuffer=null;_watermarkWidth=0;_watermarkHeight=0;_watermarkMargin=4;_wmLocPos=-1;_wmLocTc=-1;_wmLocTex=null;_wmPosData=new Float32Array(8);_wmClickHandler=null;_wmMoveHandler=null;_wmMoveRafPending=!1;_wmCachedRect=null;_wmRectCacheTime=0;_gradientVAO=null;_watermarkVAO=null;constructor(e){const{ref:i,speed:s=4,horizontalPressure:o=3,verticalPressure:t=3,waveFrequencyX:l=5,waveFrequencyY:r=5,waveAmplitude:u=3,colors:c,highlights:w=4,shadows:v=4,colorSaturation:f=0,colorBrightness:y=1,colorBlending:a=5,grainScale:h=2,grainIntensity:R=.55,grainSparsity:d=0,grainSpeed:b=.1,wireframe:A=!1,backgroundColor:x="#FFFFFF",backgroundAlpha:_=1,resolution:T=1,seed:F,yOffset:g=0,yOffsetWaveMultiplier:S=4,yOffsetColorMultiplier:B=4,yOffsetFlowMultiplier:E=4,flowDistortionA:P=0,flowDistortionB:U=0,flowScale:z=1,flowEase:M=0,flowEnabled:C=!0,enableProceduralTexture:I=!1,textureVoidLikelihood:V=.45,textureVoidWidthMin:D=200,textureVoidWidthMax:W=486,textureBandDensity:Ce=2.15,textureColorBlending:Me=.01,textureSeed:Be=333,textureEase:Ue=.5,proceduralBackgroundColor:ze="#000000",transparentTextureVoid:Ie=!1,textureShapeTriangles:Le=20,textureShapeCircles:De=15,textureShapeBars:ke=15,textureShapeSquiggles:Oe=10,domainWarpEnabled:Ve=!1,domainWarpIntensity:Ye=.5,domainWarpScale:Ne=1,vignetteIntensity:We=0,vignetteRadius:Xe=.8,fresnelEnabled:He=!1,fresnelPower:qe=2,fresnelIntensity:Ge=.5,fresnelColor:je="#FFFFFF",iridescenceEnabled:Ze=!1,iridescenceIntensity:$e=.5,iridescenceSpeed:Ke=1,bloomIntensity:Je=0,bloomThreshold:Qe=.7,chromaticAberration:et=0,silhouetteFade:tt=.25,cylinderFade:it=.08,ribbonFade:ot=.05,flatShading:rt=!0,cameraLock:st=!1,cameraX:nt=0,cameraY:at=0,cameraZ:lt=0,cameraRotationX:ut=0,cameraRotationY:_t=0,cameraRotationZ:ct=0,cameraZoom:ft=1,shapeType:ht="plane",shapeRotationX:dt=0,shapeRotationY:mt=0,shapeRotationZ:pt=0,shapeAutoRotateSpeedX:vt=0,shapeAutoRotateSpeedY:gt=0,sphereRadius:yt=15,torusRadius:xt=15,torusTube:bt=5,cylinderRadius:wt=10,cylinderHeight:Rt=40,planeBend:At=0,planeTwist:St=0,licenseKey:fe,preserveDrawingBuffer:Tt=!1,antialias:Et=!1}=e;this._ref=i,this._antialias=Et,this.destroy=this.destroy.bind(this),this._initScene=this._initScene.bind(this),this.speed=s,this.horizontalPressure=o,this.verticalPressure=t,this.waveFrequencyX=l,this.waveFrequencyY=r,this.waveAmplitude=u,this.colorBlending=a,this._resolution=T,this.grainScale=h,this.grainIntensity=R,this.grainSparsity=d,this.grainSpeed=b,this.colors=c,this.shadows=v,this.highlights=w,this.colorSaturation=f,this.colorBrightness=y,this.wireframe=A,this.backgroundColor=x,this.backgroundAlpha=_,this.yOffset=g,this.yOffsetWaveMultiplier=S,this.yOffsetColorMultiplier=B,this.yOffsetFlowMultiplier=E,this.flowDistortionA=P,this.flowDistortionB=U,this.flowScale=z,this.flowEase=M,this.flowEnabled=C,this.enableProceduralTexture=I,this.textureVoidLikelihood=V,this.textureVoidWidthMin=D,this.textureVoidWidthMax=W,this.textureBandDensity=Ce,this.textureColorBlending=Me,this.textureSeed=Be,this.textureEase=Ue,this._proceduralBackgroundColor=ze,this.transparentTextureVoid=Ie,this._textureShapeTriangles=Le,this._textureShapeCircles=De,this._textureShapeBars=ke,this._textureShapeSquiggles=Oe,this.domainWarpEnabled=Ve,this.domainWarpIntensity=Ye,this.domainWarpScale=Ne,this.vignetteIntensity=We,this.vignetteRadius=Xe,this.fresnelEnabled=He,this.fresnelPower=qe,this.fresnelIntensity=Ge,this.fresnelColor=je,this.iridescenceEnabled=Ze,this.iridescenceIntensity=$e,this.iridescenceSpeed=Ke,this.bloomIntensity=Je,this.bloomThreshold=Qe,this.chromaticAberration=et,this.silhouetteFade=tt,this.cylinderFade=it,this.ribbonFade=ot,this._flatShading=rt,this._cameraLock=st,this._cameraX=nt,this._cameraY=at,this._cameraZ=lt,this._cameraRotationX=ut,this._cameraRotationY=_t,this._cameraRotationZ=ct,this._cameraZoom=ft,this._shapeType=ht,this._shapeRotationX=dt,this._shapeRotationY=mt,this._shapeRotationZ=pt,this._shapeAutoRotateSpeedX=vt,this._shapeAutoRotateSpeedY=gt,this._sphereRadius=yt,this._torusRadius=xt,this._torusTube=bt,this._cylinderRadius=wt,this._cylinderHeight=Rt,this._planeBend=At,this._planeTwist=St,this.glState=this._initScene(T,Tt),this._initWatermark(),Ee(),fe?Re(fe).then(n=>{this._licensed=n.valid,n.valid||(console.warn(`NEAT license key error: ${n.reason}`),_e())}):_e();let K=F!==void 0?F:Te(),J=performance.now();const G=()=>{const{gl:n,program:k,locations:p,indexCount:H,indexType:j}=this.glState;if(this._initialized){const he=performance.now();K+=(he-J)/1e3*this._speed,J=he,n.useProgram(k),n.uniform1f(p.uniforms.u_time,K);const Q=this.glState.camera,O=this._modelViewMatrix;O.identity(),O.translate(-Q.position[0]-this._cameraX,-Q.position[1]-this._cameraY,-Q.position[2]-this._cameraZ),O.translate(0,0,-1),O.rotateX(-this._cameraRotationX),O.rotateY(-this._cameraRotationY),O.rotateZ(-this._cameraRotationZ);let ee=this._shapeRotationX,de=this._shapeRotationY,Pt=this._shapeRotationZ;this._shapeAutoRotateSpeedX!==0&&(ee+=K*this._shapeAutoRotateSpeedX*.1),this._shapeAutoRotateSpeedY!==0&&(de+=K*this._shapeAutoRotateSpeedY*.1),this._shapeType==="plane"||this._shapeType==="ribbon"?O.rotateX(ee-Math.PI/3.5):O.rotateX(ee),O.rotateY(de),O.rotateZ(Pt);const me=p.uniforms.modelViewMatrix;if(me&&n.uniformMatrix4fv(me,!1,O.elements),this._yOffsetDirty&&!this._uniformsDirty&&(n.uniform1f(p.uniforms.u_y_offset,this._yOffset),this._yOffsetDirty=!1),this._uniformsDirty){n.uniform2f(p.uniforms.u_resolution,this._ref.width,this._ref.height),n.uniform2f(p.uniforms.u_color_pressure,this._horizontalPressure,this._verticalPressure),n.uniform1f(p.uniforms.u_wave_frequency_x,this._waveFrequencyX),n.uniform1f(p.uniforms.u_wave_frequency_y,this._waveFrequencyY),n.uniform1f(p.uniforms.u_wave_amplitude,this._waveAmplitude),n.uniform1f(p.uniforms.u_color_blending,this._colorBlending),n.uniform1f(p.uniforms.u_shadows,this._shadows),n.uniform1f(p.uniforms.u_highlights,this._highlights),n.uniform1f(p.uniforms.u_saturation,this._saturation),n.uniform1f(p.uniforms.u_brightness,this._brightness),n.uniform1f(p.uniforms.u_grain_intensity,this._grainIntensity),n.uniform1f(p.uniforms.u_grain_sparsity,this._grainSparsity),n.uniform1f(p.uniforms.u_grain_speed,this._grainSpeed),n.uniform1f(p.uniforms.u_grain_scale,this._grainScale),n.uniform1f(p.uniforms.u_y_offset,this._yOffset),n.uniform1f(p.uniforms.u_y_offset_wave_multiplier,this._yOffsetWaveMultiplier),n.uniform1f(p.uniforms.u_y_offset_color_multiplier,this._yOffsetColorMultiplier),n.uniform1f(p.uniforms.u_y_offset_flow_multiplier,this._yOffsetFlowMultiplier),n.uniform1f(p.uniforms.u_flow_distortion_a,this._flowDistortionA),n.uniform1f(p.uniforms.u_flow_distortion_b,this._flowDistortionB),n.uniform1f(p.uniforms.u_flow_scale,this._flowScale),n.uniform1f(p.uniforms.u_flow_ease,this._flowEase),n.uniform1f(p.uniforms.u_flow_enabled,this._flowEnabled?1:0);let L=0;this._shapeType==="sphere"?L=1:this._shapeType==="torus"?L=2:this._shapeType==="cylinder"?L=3:this._shapeType==="ribbon"&&(L=4),n.uniform1f(p.uniforms.u_shape_type,L),n.uniform1f(p.uniforms.u_enable_procedural_texture,this._enableProceduralTexture?1:0),n.uniform1f(p.uniforms.u_texture_ease,this._textureEase),n.uniform1f(p.uniforms.u_transparent_texture_void,this._transparentTextureVoid?1:0),n.uniform1f(p.uniforms.u_domain_warp_enabled,this._domainWarpEnabled?1:0),n.uniform1f(p.uniforms.u_domain_warp_intensity,this._domainWarpIntensity),n.uniform1f(p.uniforms.u_domain_warp_scale,this._domainWarpScale),n.uniform1f(p.uniforms.u_vignette_intensity,this._vignetteIntensity),n.uniform1f(p.uniforms.u_vignette_radius,this._vignetteRadius),n.uniform1f(p.uniforms.u_fresnel_enabled,this._fresnelEnabled?1:0),n.uniform1f(p.uniforms.u_fresnel_power,this._fresnelPower),n.uniform1f(p.uniforms.u_fresnel_intensity,this._fresnelIntensity),n.uniform3fv(p.uniforms.u_fresnel_color,this._fresnelColorRgb),n.uniform1f(p.uniforms.u_iridescence_enabled,this._iridescenceEnabled?1:0),n.uniform1f(p.uniforms.u_iridescence_intensity,this._iridescenceIntensity),n.uniform1f(p.uniforms.u_iridescence_speed,this._iridescenceSpeed),n.uniform1f(p.uniforms.u_bloom_intensity,this._bloomIntensity),n.uniform1f(p.uniforms.u_bloom_threshold,this._bloomThreshold),n.uniform1f(p.uniforms.u_chromatic_aberration,this._chromaticAberration),n.uniform1f(p.uniforms.u_silhouette_fade,this._silhouetteFade),n.uniform1f(p.uniforms.u_cylinder_fade,this._cylinderFade),n.uniform1f(p.uniforms.u_ribbon_fade,this._ribbonFade),n.uniform1f(p.uniforms.u_flat_shading,this._flatShading?1:0),this._uniformsDirty=!1,this._yOffsetDirty=!1}if(this._textureNeedsUpdate&&this._enableProceduralTexture&&(this._proceduralTexture&&n.deleteTexture(this._proceduralTexture),this._proceduralTexture=this._createProceduralTexture(n),this._textureNeedsUpdate=!1,this._textureDirty=!0),this._textureDirty&&this._proceduralTexture&&(n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,this._proceduralTexture),n.uniform1i(p.uniforms.u_procedural_texture,1),this._textureDirty=!1),this._colorsChanged){this._colorsChanged=!1;for(let L=0;L<$;L++)if(L<this._colors.length){const pe=this._colors[L],Ct=this._cachedColorRgb[L]||[0,0,0];n.uniform1f(p.uniforms[`u_colors[${L}].is_active`],pe.enabled?1:0),n.uniform3fv(p.uniforms[`u_colors[${L}].color`],Ct),n.uniform1f(p.uniforms[`u_colors[${L}].influence`],pe.influence||0)}else n.uniform1f(p.uniforms[`u_colors[${L}].is_active`],0);n.uniform1i(p.uniforms.u_colors_count,$)}}n.clearColor(this._backgroundColorRgb[0],this._backgroundColorRgb[1],this._backgroundColorRgb[2],this._backgroundAlpha),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT),this._wireframe?(n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,this.glState.buffers.wireframeIndex),n.drawElements(n.LINES,this.glState.wireframeIndexCount,j,0),n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,this.glState.buffers.index)):n.drawElements(n.TRIANGLES,H,j,0),this._licensed||this._renderWatermark(n),this._isVisible&&(this.requestRef=requestAnimationFrame(G))};this._visibilityObserver=new IntersectionObserver(n=>{const k=this._isVisible;this._isVisible=n[0].isIntersecting&&document.visibilityState!=="hidden",this._isVisible&&!k&&(J=performance.now(),this.requestRef=requestAnimationFrame(G))},{threshold:0}),this._visibilityObserver.observe(i),this._visibilityHandler=()=>{const n=this._isVisible;document.visibilityState==="hidden"?this._isVisible=!1:(this._isVisible=!0,n||(J=performance.now(),this.requestRef=requestAnimationFrame(G)))},document.addEventListener("visibilitychange",this._visibilityHandler);const Ft=(n,k)=>{if(this._ref.width===n&&this._ref.height===k)return;const{gl:p,camera:H}=this.glState;this._ref.width=n,this._ref.height=k,p.viewport(0,0,n,k),Z(H,n,k,Y,N,this._shapeType,this._cameraZoom);const j=this.glState.locations.uniforms.projectionMatrix;p.useProgram(this.glState.program),j&&p.uniformMatrix4fv(j,!1,H.projectionMatrix.elements),this._uniformsDirty=!0,G()};this.sizeObserver=new ResizeObserver(n=>{const k=n[n.length-1],p=Math.round(k.contentRect.width),H=Math.round(k.contentRect.height);this._resizeTimeoutId!==null&&clearTimeout(this._resizeTimeoutId),this._resizeTimeoutId=window.setTimeout(()=>{Ft(p,H),this._resizeTimeoutId=null,this._wmCachedRect=null},100)}),this.sizeObserver.observe(i),G()}destroy(){if(cancelAnimationFrame(this.requestRef),this.sizeObserver.disconnect(),this._visibilityObserver&&(this._visibilityObserver.disconnect(),this._visibilityObserver=null),this._visibilityHandler&&(document.removeEventListener("visibilitychange",this._visibilityHandler),this._visibilityHandler=null),this._resizeTimeoutId!==null&&(clearTimeout(this._resizeTimeoutId),this._resizeTimeoutId=null),this._wmClickHandler&&(document.removeEventListener("click",this._wmClickHandler,!0),this._wmClickHandler=null),this._wmMoveHandler&&(document.removeEventListener("mousemove",this._wmMoveHandler),this._wmMoveHandler=null),this.glState){const e=this.glState.gl;e.deleteProgram(this.glState.program),e.deleteBuffer(this.glState.buffers.position),e.deleteBuffer(this.glState.buffers.normal),e.deleteBuffer(this.glState.buffers.uv),e.deleteBuffer(this.glState.buffers.index),e.deleteBuffer(this.glState.buffers.wireframeIndex),this._watermarkProgram&&e.deleteProgram(this._watermarkProgram),this._watermarkTexture&&e.deleteTexture(this._watermarkTexture),this._watermarkBuffer&&e.deleteBuffer(this._watermarkBuffer),this._watermarkTexCoordBuffer&&e.deleteBuffer(this._watermarkTexCoordBuffer);const i=e;i.deleteVertexArray&&(this._gradientVAO&&i.deleteVertexArray(this._gradientVAO),this._watermarkVAO&&i.deleteVertexArray(this._watermarkVAO))}this._proceduralTexture&&this.glState&&this.glState.gl.deleteTexture(this._proceduralTexture)}get colors(){return this._colors}set colors(e){this._uniformsDirty=!0,this._colors=e,this._cachedColorRgb=e.map(i=>this._hexToRgb(i.color)),this._colorsChanged=!0}get grainScale(){return this._grainScale}set grainScale(e){this._uniformsDirty=!0,this._grainScale=e==0?1:e}get resolution(){return this._resolution}set resolution(e){this._resolution!==e&&(this._resolution=e,this._updateGeometry())}get antialias(){return this._antialias}set antialias(e){this._antialias!==e&&(this._antialias=e,console.warn("NeatGradient: Changing 'antialias' at runtime is not supported because the WebGL context is already created. Recreate the NeatGradient instance to apply this change."))}get backgroundColor(){return this._backgroundColor}set backgroundColor(e){this._uniformsDirty=!0,this._backgroundColor=e,this._backgroundColorRgb=this._hexToRgb(e)}get yOffset(){return this._yOffset}set yOffset(e){this._yOffset!==e&&(this._yOffsetDirty=!0,this._yOffset=e)}get enableProceduralTexture(){return this._enableProceduralTexture}set enableProceduralTexture(e){this._uniformsDirty=!0,this._enableProceduralTexture=e,e&&!this._proceduralTexture&&(this._textureNeedsUpdate=!0)}_updateGeometry(){if(!this.glState)return;const e=this.glState.gl,i=this._resolution||1;let s;this._shapeType==="sphere"?s=se(this._sphereRadius,120*i,120*i):this._shapeType==="torus"?s=ne(this._torusRadius,this._torusTube,120*i,120*i):this._shapeType==="cylinder"?s=ae(this._cylinderRadius,this._cylinderRadius,this._cylinderHeight,120*i,120*i):this._shapeType==="ribbon"?s=le(Y,N,240*i,240*i,this._planeBend,this._planeTwist):s=re(Y,N,240*i,240*i);const{position:o,normal:t,uv:l,index:r,wireframeIndex:u}=s;e.bindBuffer(e.ARRAY_BUFFER,this.glState.buffers.position),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,this.glState.buffers.normal),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,this.glState.buffers.uv),e.bufferData(e.ARRAY_BUFFER,l,e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.glState.buffers.index),e.bufferData(e.ELEMENT_ARRAY_BUFFER,r,e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.glState.buffers.wireframeIndex),e.bufferData(e.ELEMENT_ARRAY_BUFFER,u,e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.glState.buffers.index),this.glState.indexCount=r.length,this.glState.wireframeIndexCount=u.length,this.glState.indexType=r instanceof Uint32Array?e.UNSIGNED_INT:e.UNSIGNED_SHORT;const c=this._ref.width,w=this._ref.height;Z(this.glState.camera,c,w,Y,N,this._shapeType,this._cameraZoom);const v=this.glState.locations.uniforms.projectionMatrix;e.useProgram(this.glState.program),v&&e.uniformMatrix4fv(v,!1,this.glState.camera.projectionMatrix.elements),this._uniformsDirty=!0}_hexToRgb(e){const i=parseInt(e.replace("#",""),16);return[(i>>16&255)/255,(i>>8&255)/255,(i&255)/255]}_initScene(e,i=!1){let s=this._ref.width,o=this._ref.height;(s===0||o===0||s===300&&o===150)&&(s=this._ref.clientWidth||300,o=this._ref.clientHeight||150,this._ref.width=s,this._ref.height=o);const t=this._ref.getContext("webgl2",{alpha:!0,preserveDrawingBuffer:i,antialias:this._antialias})||this._ref.getContext("webgl",{alpha:!0,preserveDrawingBuffer:i,antialias:this._antialias});if(!t)throw new Error("WebGL not supported");t.getExtension("OES_standard_derivatives"),t.getExtension("OES_element_index_uint"),t.viewport(0,0,s,o);let l;this._shapeType==="sphere"?l=se(this._sphereRadius,120*e,120*e):this._shapeType==="torus"?l=ne(this._torusRadius,this._torusTube,120*e,120*e):this._shapeType==="cylinder"?l=ae(this._cylinderRadius,this._cylinderRadius,this._cylinderHeight,120*e,120*e):this._shapeType==="ribbon"?l=le(Y,N,240*e,240*e,this._planeBend,this._planeTwist):l=re(Y,N,240*e,240*e);const{position:r,normal:u,uv:c,index:w,wireframeIndex:v}=l,f=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,f),t.bufferData(t.ARRAY_BUFFER,r,t.STATIC_DRAW);const y=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,y),t.bufferData(t.ARRAY_BUFFER,u,t.STATIC_DRAW);const a=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,a),t.bufferData(t.ARRAY_BUFFER,c,t.STATIC_DRAW);const h=t.createBuffer();t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,h),t.bufferData(t.ELEMENT_ARRAY_BUFFER,w,t.STATIC_DRAW);const R=t.createBuffer();t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,R),t.bufferData(t.ELEMENT_ARRAY_BUFFER,v,t.STATIC_DRAW),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,h);const d=ge()+`
`+te()+`
`+ie()+`
`+q,b=t.createShader(t.VERTEX_SHADER);t.shaderSource(b,d),t.compileShader(b),t.getShaderParameter(b,t.COMPILE_STATUS)||(console.log("VERTEX_SHADER_ERROR_START"),console.log("Vertex shader error: ",t.getShaderInfoLog(b)),console.log("GL Error Code:",t.getError()),console.log("Vertex Shader Source Dump:"),console.log(d.split(`
`).map((C,I)=>`${I+1}: ${C}`).join(`
`)),console.log("VERTEX_SHADER_ERROR_END"));const A=ye()+`
`+ie()+`
`+te()+`
`+ve,x=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(x,A),t.compileShader(x),t.getShaderParameter(x,t.COMPILE_STATUS)||(console.log("FRAGMENT_SHADER_ERROR_START"),console.log("Fragment shader error: ",t.getShaderInfoLog(x)),console.log("GL Error Code:",t.getError()),console.log("Fragment Shader Source Dump:"),console.log(A.split(`
`).map((C,I)=>`${I+1}: ${C}`).join(`
`)),console.log("FRAGMENT_SHADER_ERROR_END"));const _=t.createProgram();t.attachShader(_,b),t.attachShader(_,x),t.linkProgram(_),t.getProgramParameter(_,t.LINK_STATUS)||(console.log("PROGRAM_LINK_ERROR_START"),console.log("Program linking error: ",t.getProgramInfoLog(_)),console.log("GL Error Code:",t.getError()),console.log("PROGRAM_LINK_ERROR_END")),t.useProgram(_);const T=new xe(0,0,0,0,0,1e3);T.position=[0,0,5],Z(T,s,o,Y,N,this._shapeType,this._cameraZoom);const F=t.getAttribLocation(_,"position"),g=t.getAttribLocation(_,"normal"),S=t.getAttribLocation(_,"uv");t.enableVertexAttribArray(F),t.bindBuffer(t.ARRAY_BUFFER,f),t.vertexAttribPointer(F,3,t.FLOAT,!1,0,0),t.enableVertexAttribArray(g),t.bindBuffer(t.ARRAY_BUFFER,y),t.vertexAttribPointer(g,3,t.FLOAT,!1,0,0),t.enableVertexAttribArray(S),t.bindBuffer(t.ARRAY_BUFFER,a),t.vertexAttribPointer(S,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,h);const B=t.getUniformLocation(_,"projectionMatrix");t.uniformMatrix4fv(B,!1,T.projectionMatrix.elements);const E=t.getUniformLocation(_,"u_plane_width");t.uniform1f(E,Y);const P=t.getUniformLocation(_,"u_plane_height");t.uniform1f(P,N);const U=t.getUniformLocation(_,"u_colors_count");t.uniform1i(U,$);const z=["projectionMatrix","modelViewMatrix","u_time","u_resolution","u_color_pressure","u_wave_frequency_x","u_wave_frequency_y","u_wave_amplitude","u_colors_count","u_plane_width","u_plane_height","u_shadows","u_highlights","u_grain_intensity","u_grain_sparsity","u_grain_scale","u_grain_speed","u_flow_distortion_a","u_flow_distortion_b","u_flow_scale","u_flow_ease","u_flow_enabled","u_y_offset","u_y_offset_wave_multiplier","u_y_offset_color_multiplier","u_y_offset_flow_multiplier","u_procedural_texture","u_enable_procedural_texture","u_texture_ease","u_transparent_texture_void","u_saturation","u_brightness","u_color_blending","u_domain_warp_enabled","u_domain_warp_intensity","u_domain_warp_scale","u_vignette_intensity","u_vignette_radius","u_fresnel_enabled","u_fresnel_power","u_fresnel_intensity","u_fresnel_color","u_iridescence_enabled","u_iridescence_intensity","u_iridescence_speed","u_bloom_intensity","u_bloom_threshold","u_chromatic_aberration","u_shape_type","u_silhouette_fade","u_cylinder_fade","u_ribbon_fade","u_flat_shading"],M={attributes:{position:F,normal:g,uv:S},uniforms:{}};z.forEach(C=>{M.uniforms[C]=t.getUniformLocation(_,C)});for(let C=0;C<$;C++)M.uniforms[`u_colors[${C}].is_active`]=t.getUniformLocation(_,`u_colors[${C}].is_active`),M.uniforms[`u_colors[${C}].color`]=t.getUniformLocation(_,`u_colors[${C}].color`),M.uniforms[`u_colors[${C}].influence`]=t.getUniformLocation(_,`u_colors[${C}].influence`);return this._initialized=!0,this._uniformsDirty=!0,this._colorsChanged=!0,this._textureDirty=!0,t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.enable(t.DEPTH_TEST),{gl:t,program:_,buffers:{position:f,normal:y,uv:a,index:h,wireframeIndex:R},locations:M,camera:T,indexCount:w.length,wireframeIndexCount:v.length,indexType:w instanceof Uint32Array?t.UNSIGNED_INT:t.UNSIGNED_SHORT}}_createProceduralTexture(e){this._sourceCanvas||(this._sourceCanvas=document.createElement("canvas"),this._sourceCanvas.width=1024,this._sourceCanvas.height=1024,this._sourceCtx=this._sourceCanvas.getContext("2d"));const s=this._sourceCanvas,o=this._sourceCtx;if(!o)return null;let t=this._textureSeed;const l=this._textureSeed;function r(){const g=Math.sin(t++)*1e4;return g-Math.floor(g)}const u=g=>{t=l+g},c=this._colors.filter(g=>g.enabled).map(g=>g.color);if(c.length===0)return null;const w=this._shapeType!=="plane",v=w?[-1,0,1]:[0],f=w?[-1,0,1]:[0];function y(g){const S=parseInt(g.replace("#",""),16);return{r:S>>16&255,g:S>>8&255,b:S&255}}function a(g,S,B){return"#"+((1<<24)+(Math.round(g)<<16)+(Math.round(S)<<8)+Math.round(B)).toString(16).slice(1).padStart(6,"0")}const h=()=>{const g=c[Math.floor(r()*c.length)],S=c[Math.floor(r()*c.length)],B=r()*this._textureColorBlending,E=y(g),P=y(S),U=E.r+(P.r-E.r)*B,z=E.g+(P.g-E.g)*B,M=E.b+(P.b-E.b)*B;return a(U,z,M)},R=this._proceduralBackgroundColor||"#000000";o.fillStyle=R,o.fillRect(0,0,1024,1024);const d=o.createLinearGradient(0,0,0,1024);d.addColorStop(0,h()),d.addColorStop(1,h()),o.fillStyle=d,o.fillRect(0,0,1024,1024);for(let g=0;g<this._textureShapeTriangles;g++){const S=h(),B=r()*1024,E=r()*1024,P=100+r()*300,U=(r()-.5)*P,z=(r()-.5)*P,M=(r()-.5)*P,C=(r()-.5)*P;for(const I of v)for(const V of f){o.fillStyle=S,o.beginPath();const D=B+I*1024,W=E+V*1024;o.moveTo(D,W),o.lineTo(D+U,W+z),o.lineTo(D+M,W+C),o.fill()}}for(let g=0;g<this._textureShapeCircles;g++){const S=h(),B=10+r()*50,E=r()*1024,P=r()*1024,U=50+r()*150;for(const z of v)for(const M of f)o.strokeStyle=S,o.lineWidth=B,o.beginPath(),o.arc(E+z*1024,P+M*1024,U,0,Math.PI*2),o.stroke()}for(let g=0;g<this._textureShapeBars;g++){const S=h(),B=r()*1024,E=r()*1024,P=r()*Math.PI;for(const U of v)for(const z of f)o.fillStyle=S,o.save(),o.translate(B+U*1024,E+z*1024),o.rotate(P),o.fillRect(-150,-25,300,50),o.restore()}o.lineWidth=15,o.lineCap="round";for(let g=0;g<this._textureShapeSquiggles;g++){const S=h(),B=r()*1024,E=r()*1024,P=[];let U=0,z=0;for(let M=0;M<4;M++){const C=U+(r()-.5)*300,I=z+(r()-.5)*300;P.push({cx1:U+(r()-.5)*300,cy1:z+(r()-.5)*300,cx2:U+(r()-.5)*300,cy2:z+(r()-.5)*300,ex:C,ey:I}),U=C,z=I}for(const M of v)for(const C of f){o.strokeStyle=S,o.beginPath();const I=B+M*1024,V=E+C*1024;o.moveTo(I,V);for(const D of P)o.bezierCurveTo(I+D.cx1,V+D.cy1,I+D.cx2,V+D.cy2,I+D.ex,V+D.ey);o.stroke()}}u(5e4),this._maskedCanvas||(this._maskedCanvas=document.createElement("canvas"),this._maskedCanvas.width=1024,this._maskedCanvas.height=1024,this._maskedCtx=this._maskedCanvas.getContext("2d"));const b=this._maskedCanvas,A=this._maskedCtx;if(!A)return null;this._transparentTextureVoid?A.clearRect(0,0,1024,1024):(A.fillStyle=R,A.fillRect(0,0,1024,1024));let x=0;const _=[];for(;x<1024;)if(r()<this._textureVoidLikelihood){const S=this._textureVoidWidthMin+r()*(this._textureVoidWidthMax-this._textureVoidWidthMin);_.push({type:"void",x,width:S}),x+=S}else{const S=50+r()*200;_.push({type:"matter",x,width:S}),x+=S}for(const g of _)if(g.type==="matter"){const S=g.x,B=Math.min(g.x+g.width,1024);let E=S;for(;E<B;){const P=(2+r()*20)/this._textureBandDensity,U=Math.floor(r()*1024);A.drawImage(s,U,0,P,1024,E,0,P,1024),E+=P}}const T=e.createTexture();e.bindTexture(e.TEXTURE_2D,T),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,b),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.generateMipmap(e.TEXTURE_2D);const F=e.getExtension("EXT_texture_filter_anisotropic")||e.getExtension("MOZ_EXT_texture_filter_anisotropic")||e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");if(F){const g=e.getParameter(F.MAX_TEXTURE_MAX_ANISOTROPY_EXT);e.texParameterf(e.TEXTURE_2D,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(16,g))}return T}get fresnelColor(){return this._fresnelColor}set fresnelColor(e){this._fresnelColor!==e&&(this._fresnelColor=e,this._fresnelColorRgb=this._hexToRgb(e),this._uniformsDirty=!0)}get shapeType(){return this._shapeType}set shapeType(e){this._shapeType!==e&&(this._shapeType=e,this._updateGeometry())}get cameraLock(){return this._cameraLock}set cameraLock(e){this._cameraLock=e}get cameraZoom(){return this._cameraZoom}set cameraZoom(e){this._cameraZoom!==e&&(this._cameraZoom=e,this._updateCameraFrustum())}_updateCameraFrustum(){if(!this.glState)return;const e=this.glState.gl,i=this._ref.width,s=this._ref.height;Z(this.glState.camera,i,s,Y,N,this._shapeType,this._cameraZoom);const o=this.glState.locations.uniforms.projectionMatrix;e.useProgram(this.glState.program),o&&e.uniformMatrix4fv(o,!1,this.glState.camera.projectionMatrix.elements),this._uniformsDirty=!0}_initWatermark(){const e=this.glState.gl,i=e,s=typeof i.createVertexArray=="function",o=e.createShader(e.VERTEX_SHADER);e.shaderSource(o,Fe),e.compileShader(o);const t=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(t,Pe),e.compileShader(t);const l=e.createProgram();e.attachShader(l,o),e.attachShader(l,t),e.linkProgram(l),this._watermarkProgram=l,e.deleteShader(o),e.deleteShader(t);const r=13,u=6,c=5,w=document.createElement("canvas").getContext("2d");w.font=`bold ${r}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;const v=w.measureText("NEAT"),f=Math.ceil(v.width),y=r,a=f+u*2,h=y+c*2;this._watermarkWidth=a,this._watermarkHeight=h;const R=document.createElement("canvas");R.width=a,R.height=h;const d=R.getContext("2d");d.clearRect(0,0,a,h),d.shadowColor="rgba(0,0,0,0.4)",d.shadowBlur=2,d.shadowOffsetX=1,d.shadowOffsetY=1,d.font=`bold ${r}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,d.textAlign="center",d.textBaseline="middle",d.fillStyle="rgba(255,255,255,0.5)",d.fillText("NEAT",a/2,h/2);const b=e.createTexture();e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,b),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,R),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),this._watermarkTexture=b;const A=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,A),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,1,1,1,0,0,1,0]),e.STATIC_DRAW),this._watermarkTexCoordBuffer=A;const x=e.createBuffer();if(e.bindBuffer(e.ARRAY_BUFFER,x),e.bufferData(e.ARRAY_BUFFER,new Float32Array(8),e.DYNAMIC_DRAW),this._watermarkBuffer=x,this._wmLocPos=e.getAttribLocation(l,"a_wm_position"),this._wmLocTc=e.getAttribLocation(l,"a_wm_texcoord"),this._wmLocTex=e.getUniformLocation(l,"u_wm_texture"),s){this._watermarkVAO=i.createVertexArray(),i.bindVertexArray(this._watermarkVAO),e.enableVertexAttribArray(this._wmLocPos),e.bindBuffer(e.ARRAY_BUFFER,x),e.vertexAttribPointer(this._wmLocPos,2,e.FLOAT,!1,0,0),e.enableVertexAttribArray(this._wmLocTc),e.bindBuffer(e.ARRAY_BUFFER,A),e.vertexAttribPointer(this._wmLocTc,2,e.FLOAT,!1,0,0),this._gradientVAO=i.createVertexArray(),i.bindVertexArray(this._gradientVAO);const _=this.glState.locations.attributes;e.enableVertexAttribArray(_.position),e.bindBuffer(e.ARRAY_BUFFER,this.glState.buffers.position),e.vertexAttribPointer(_.position,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(_.normal),e.bindBuffer(e.ARRAY_BUFFER,this.glState.buffers.normal),e.vertexAttribPointer(_.normal,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(_.uv),e.bindBuffer(e.ARRAY_BUFFER,this.glState.buffers.uv),e.vertexAttribPointer(_.uv,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.glState.buffers.index),i.bindVertexArray(this._gradientVAO)}this._wmClickHandler=_=>{this._licensed||this._isOverWatermark(_)&&(_.preventDefault(),_.stopPropagation(),window.open("https://neat.firecms.co","_blank","noopener"))},this._wmMoveHandler=_=>{if(this._licensed){this._currentCursor!==""&&(this._currentCursor="",this._ref.style.cursor="",document.body.style.cursor="");return}this._wmMoveRafPending||(this._wmMoveRafPending=!0,requestAnimationFrame(()=>{this._wmMoveRafPending=!1;const T=performance.now();(!this._wmCachedRect||T-this._wmRectCacheTime>500)&&(this._wmCachedRect=this._ref.getBoundingClientRect(),this._wmRectCacheTime=T);const F=this._wmCachedRect,g=_.clientX-F.left,S=_.clientY-F.top,B=F.width,E=F.height;let P="";if(g>=0&&S>=0&&g<=B&&S<=E){const U=this._watermarkMargin,z=this._watermarkWidth,M=this._watermarkHeight,C=B-U-z,I=E-U-M;g>=C&&g<=B-U&&S>=I&&S<=E-U&&(P="pointer")}this._currentCursor!==P&&(this._currentCursor=P,this._ref.style.cursor=P,document.body.style.cursor=P)}))},document.addEventListener("click",this._wmClickHandler,!0),document.addEventListener("mousemove",this._wmMoveHandler)}_isOverWatermark(e){this._wmCachedRect||(this._wmCachedRect=this._ref.getBoundingClientRect(),this._wmRectCacheTime=performance.now());const i=this._wmCachedRect,s=e.clientX-i.left,o=e.clientY-i.top,t=i.width,l=i.height;if(s<0||o<0||s>t||o>l)return!1;const r=this._watermarkMargin,u=this._watermarkWidth,c=this._watermarkHeight,w=t-r-u,v=l-r-c;return s>=w&&s<=t-r&&o>=v&&o<=l-r}_renderWatermark(e){const i=this._watermarkProgram,s=this._watermarkTexture,o=this._watermarkBuffer;if(!i||!s||!o)return;const t=this._ref.width,l=this._ref.height;if(t===0||l===0)return;const r=4,u=this._watermarkWidth,c=this._watermarkHeight,w=1-r/t*2,v=w-u/t*2,f=-1+r/l*2,y=f+c/l*2,a=this._wmPosData;a[0]=v,a[1]=f,a[2]=w,a[3]=f,a[4]=v,a[5]=y,a[6]=w,a[7]=y,e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferSubData(e.ARRAY_BUFFER,0,a);const h=e,R=this._watermarkVAO!==null;if(e.useProgram(i),e.disable(e.DEPTH_TEST),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),R?(h.bindVertexArray(this._watermarkVAO),e.bindBuffer(e.ARRAY_BUFFER,o),e.vertexAttribPointer(this._wmLocPos,2,e.FLOAT,!1,0,0)):(e.enableVertexAttribArray(this._wmLocPos),e.bindBuffer(e.ARRAY_BUFFER,o),e.vertexAttribPointer(this._wmLocPos,2,e.FLOAT,!1,0,0),e.enableVertexAttribArray(this._wmLocTc),e.bindBuffer(e.ARRAY_BUFFER,this._watermarkTexCoordBuffer),e.vertexAttribPointer(this._wmLocTc,2,e.FLOAT,!1,0,0)),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,s),e.uniform1i(this._wmLocTex,2),e.drawArrays(e.TRIANGLE_STRIP,0,4),e.enable(e.DEPTH_TEST),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.useProgram(this.glState.program),R)h.bindVertexArray(this._gradientVAO);else{const d=this.glState.locations.attributes;e.enableVertexAttribArray(d.position),e.bindBuffer(e.ARRAY_BUFFER,this.glState.buffers.position),e.vertexAttribPointer(d.position,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(d.normal),e.bindBuffer(e.ARRAY_BUFFER,this.glState.buffers.normal),e.vertexAttribPointer(d.normal,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(d.uv),e.bindBuffer(e.ARRAY_BUFFER,this.glState.buffers.uv),e.vertexAttribPointer(d.uv,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,this.glState.buffers.index)}}}for(const[m,e,i,s,o]of Se)Object.defineProperty(ce.prototype,m,{get(){return i===1?this[e]:this[e]*i},set(t){const l=s===1?t:t*s;this[e]!==l&&(this[e]=l,this._uniformsDirty=!0,o==="t"&&this._enableProceduralTexture?this._textureNeedsUpdate=!0:o==="g"&&this._updateGeometry())},enumerable:!0,configurable:!0});function Te(){const m=new Date,e=m.getMinutes(),i=m.getSeconds();return e*60+i}function Ee(){if(document.querySelector('meta[name="generator"][content*="NEAT"]'))return;const m=document.createElement("meta");m.name="generator",m.content="NEAT by FireCMS \u2014 https://neat.firecms.co",document.head.appendChild(m)}const Fe=`
attribute vec2 a_wm_position;
attribute vec2 a_wm_texcoord;
varying vec2 v_wm_texcoord;
void main() {
    gl_Position = vec4(a_wm_position, 0.0, 1.0);
    v_wm_texcoord = a_wm_texcoord;
}
`,Pe=`
precision mediump float;
varying vec2 v_wm_texcoord;
uniform sampler2D u_wm_texture;
void main() {
    gl_FragColor = texture2D(u_wm_texture, v_wm_texcoord);
}
`;X.NeatGradient=ce,Object.defineProperties(X,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
//# sourceMappingURL=index.umd.js.map
