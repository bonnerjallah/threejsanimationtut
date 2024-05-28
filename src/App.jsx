import { useEffect } from "react"
import * as THREE from "three"

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';





function App() {

  useEffect(() => {

    const canvas = document.getElementById("myCanvas");
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true


    const scene = new THREE.Scene;

    const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 5, 10)

    const control = new OrbitControls(camera, renderer.domElement)

    //lights
    const ambientLights = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLights)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    scene.add(directionalLight)
    directionalLight.position.set(20, 10, 20)
    directionalLight.castShadow = true

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50; 

    const dlHelper = new THREE.DirectionalLightHelper(directionalLight)
    scene.add(dlHelper)


    //Grid Helper
    const gridHelper = new THREE.GridHelper(2)
    scene.add(gridHelper)

    //Plane Mesh
    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshStandardMaterial({  side: THREE.DoubleSide})
    )
    scene.add(groundMesh)
    groundMesh.receiveShadow = true 
    groundMesh.rotation.x = -0.5 * Math.PI


    //GLTF Loader
    const gltfLoader = new GLTFLoader()

    // let mixer;
    // gltfLoader.load("../src/assets/wolf/Wolf.gltf", (gltf) => {
    //   const wolf = gltf.scene;
    //   const scale = 0.1;
    
    //   // Enable casting shadows for all meshes in the model
    //   wolf.traverse((child) => {
    //     if (child.isMesh) {
    //       child.castShadow = true;
    //     }
    //   });
    
    //   wolf.scale.set(scale, scale, scale);
    
    //   wolf.getObjectByName("Cube").material.color.setHex(0x000000);
    
    //   scene.add(wolf);
    //   wolf.castShadow = true;
    
    //   mixer = new THREE.AnimationMixer(wolf);
    //   const wolfClips = gltf.animations;
    //   const wolfClip = THREE.AnimationClip.findByName(wolfClips, "Gallop");
    //   const wolfAction = mixer.clipAction(wolfClip);
    //   wolfAction.play();
    // }, undefined,
    //   (error) => {
    //     console.error('An error occurred while loading the model:', error);
    //   }
    // );

    
    // let foxMixer;
    // gltfLoader.load("../src/assets/wolf/Fox.gltf", (gltf) => {
    //   const fox = gltf.scene;
    //   const scale = 0.1;
    //   fox.scale.set(scale, scale, scale);
    //   fox.position.set(.5, 0, 0);
    
    //   fox.traverse((child) => {
    //     if (child.isMesh) {
    //       child.castShadow = true;
    //     }
    //   });
    
    //   fox.castShadow = true;
    
    //   foxMixer = new THREE.AnimationMixer(fox);
    //   const foxClips = gltf.animations;
    //   const foxClip = THREE.AnimationClip.findByName(foxClips, "Gallop");
    //   const foxAction = foxMixer.clipAction(foxClip);
    //   foxAction.play();
      
    
    //   scene.add(fox);
    // }, undefined,
    //   (error) => {
    //     console.error('An error occurred while loading the model:', error);
    //   }
    // );



    let animationActions = [];
    let activeAction;
    let previousAction;
    let currentAnimationIndex = 0;

    let arrowMixer;
    gltfLoader.load("../src/assets/arrowgirl/untitled.glb", (glft) => {
      const girl = glft.scene;
      const scale = 0.4;
      girl.scale.set(scale, scale, scale)
      girl.name = "girl"; // Ensure your model has a name



      girl.traverse((child) => {
        if(child.isMesh) {
          child.castShadow = true
        }
      })
      girl.castShadow = true
      
      scene.add(girl)

      // arrowMixer = new THREE.AnimationMixer(girl)
      // const girlclips = glft.animations;
      // const girlclip = THREE.AnimationClip.findByName(girlclips, "deathbackwards");
      // const girlAction = arrowMixer.clipAction(girlclip)
      // girlAction.play()

      arrowMixer = new THREE.AnimationMixer(girl)
      glft.animations.forEach((clip) => {
        const girlaction = arrowMixer.clipAction(clip);
        animationActions.push(girlaction)
      })

      // Set the initial animation
      activeAction = animationActions[currentAnimationIndex];

      activeAction.play();

    })

    // const toggleAnimation = () => {
    //   if (animationActions.length > 0) {
    //     previousAction = activeAction;
    //     currentAnimationIndex = (currentAnimationIndex + 1) % animationActions.length;
    //     activeAction = animationActions[currentAnimationIndex];
    
    //     previousAction.fadeOut(0.5);
    //     activeAction.reset().fadeIn(0.5).play();
    //   }
    // };

    let moveDirection = new THREE.Vector3();
    let speed = 0.001;

    const onKeyDown = (e) => {
      switch(e.code) {
        case "KeyW":
          moveDirection.z = -1;
          playAnimation("runfoward");
          break;
        
        case "KeyS":
          moveDirection.z = 1;
          playAnimation("runfoward");
          break;
        
        case "KeyA":
          moveDirection.x = -1;
          playAnimation("runfoward");
          break;

        case "KeyD":
          moveDirection.x = 1;
          playAnimation("runfoward");
          break
        
        case "KeyF":
          playAnimation("drawarrow");
          break
      }
    }


    const onKeyUp = (event) => {
      switch (event.code) {
        case "KeyW":
        case "KeyS":
          moveDirection.z = 0;
          stopAnimation("runforward");
          break;
        case "KeyA":
        case "KeyD":
          moveDirection.x = 0;
          stopAnimation("runforward");
          break;
        default:
          break;
      }
    };

    const playAnimation = (name) => {
      previousAction = activeAction;
      const clip = animationActions.find(action => action._clip.name === name);
      if (clip) {
        activeAction = clip;
        if (previousAction !== activeAction) {
          previousAction.fadeOut(0.5);
          activeAction.reset().fadeIn(0.5).play();
        }
      }
    };
    
    const stopAnimation = (name) => {
      const clip = animationActions.find(action => action._clip.name === name);
      if (clip && activeAction === clip) {
        clip.fadeOut(0.5);
      }
    };


    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);



    //RGBE Loader
    const rgbeLoader = new RGBELoader();


    // renderer.outputEncoding = THREE.sRGBEnocding
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 4

    // let carMixer;
    // rgbeLoader.load("../src/assets/MR_INT-005_WhiteNeons_NAD.hdr", (texture) => {
    //   texture.mapping = THREE.EquirectangularReflectionMapping;
    //   scene.environment = texture

    //   gltfLoader.load("../src/assets/benz_barbus_g900/scene.gltf", (gltf) => {
    //     const car = gltf.scene
    //     const scale = 0.4;
    //     car.scale.set(scale, scale, scale)
    //     car.position.set(0, 0, 0);
  
    //     car.traverse((child) => {
    //       if(child.isMesh) {
    //         child.castShadow = true
    //       }
    //     })
    //     car.castShadow = true
  
    //     scene.add(car)
    //     carMixer = car
  
    //   })
    // })

    
    
    

    //FBX LOADER
    const fbxLoader = new FBXLoader() 


    let character;
    fbxLoader.load('../src/assets/vanguard/Running.fbx', (fbx) => {
      const men = fbx;
      const scale = 0.004;
      men.scale.set(scale, scale, scale);
      men.position.set(-0.5, 0, -.5);
  
      men.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });
  
      men.castShadow = true;
  
      character = new THREE.AnimationMixer(men);
      const menClips = fbx.animations;
      const menClip = THREE.AnimationClip.findByName(menClips, "mixamo.com");
      const menAction = character.clipAction(menClip);
      menAction.play();
  
      scene.add(men);
    }, undefined, (error) => {
      console.error('An error occurred while loading the model:', error);
    });






    const clock = new THREE.Clock()

    const animate = (time) => {
      const deltaTime = clock.getDelta()

      // if (mixer) {
      //   mixer.update(deltaTime); // deltaTime should be the time elapsed since the last frame
      // } 
      
      // if(foxMixer) {
      //   foxMixer.update(deltaTime);
      // }

      // if(character) {
      //   character.update(deltaTime)
      // }

      // if(carMixer) {
      //   carMixer.rotation.y = time / 3000
      // }

      if (arrowMixer) {
        arrowMixer.update(deltaTime); // Update the mixer with the delta time
      }

      if (moveDirection.length() > 0) {
        const displacement = moveDirection.clone().multiplyScalar(speed);
        const model = scene.getObjectByName("girl");
        if (model) {
          // Calculate the target direction and rotate the model to face that direction
          const targetDirection = new THREE.Vector3().copy(moveDirection).normalize();
          model.lookAt(model.position.clone().add(targetDirection));
          model.position.add(displacement);
        }
      }
    
      

      control.update()
      renderer.render(scene, camera)
      window.requestAnimationFrame(animate)
    }

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", onWindowResize, false)

    animate()

  }, [])

  return (
    <div>
      <canvas id="myCanvas" />
    </div>
  )
}

export default App
