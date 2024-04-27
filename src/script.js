import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'
/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor').onFinishChange(()=>{
        material.color.set(parameters.materialColor)
        particlesMaterial.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test cube
 */
// Material

const textureloader = new THREE.TextureLoader();
const gradianttexture = textureloader.load('textures/gradients/3.jpg');
gradianttexture.magFilter=THREE.NearestFilter 

const material = new THREE.MeshToonMaterial({ 
    color: parameters.materialColor,
    gradientMap:gradianttexture

})

// Meshes
const distance = 4;
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)

mesh1.position.y = -distance*0;
mesh2.position.y = -distance*1;
mesh3.position.y = -distance*2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3)

const meshes = [mesh1,mesh2,mesh3];

const directlight = new THREE.DirectionalLight(0xffffff,3);
directlight.position.set(1,1,0);
scene.add(directlight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const cursor={}
cursor.x=0;
cursor.y=0;

window.addEventListener("mousemove",(event)=>{
    cursor.x = (event.clientX/sizes.width - 0.5)
    cursor.y = (event.clientY/sizes.height - 0.5)
})


const cameragroup = new THREE.Group();
scene.add(cameragroup)


const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for(let i = 0; i < particlesCount; i++)
{
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] =  distance * 0.5 - Math.random() * distance * meshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry  = new THREE.BufferGeometry();
particlesGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameragroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true

})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


let scrolly = window.scrollY;
let currentsection=0
window.addEventListener("scroll",()=>{
    scrolly = window.scrollY;
    const newsection = Math.round(scrolly/sizes.height)
    if(newsection!=currentsection){
        currentsection = newsection
        gsap.to(meshes[currentsection].rotation,{
            duration:1.5,
            ease:"power2.inOut",
            x:"+=6",
            y:"+=3",
            z:"+=1.5"
        })
    }
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previoustime = 0;
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const delta = elapsedTime - previoustime ;
    previoustime = elapsedTime;

    camera.position.y = -scrolly/sizes.height * distance;

    const parallexX = cursor.x;
    const parallexY = -cursor.y;

    cameragroup.position.x += (parallexX - cameragroup.position.x)*delta;
    cameragroup.position.y += (parallexY - cameragroup.position.y)*delta


    for(const mesh of meshes){
        mesh.rotation.x += delta *0.5;
        mesh.rotation.y += delta*0.5;
    }

    

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()