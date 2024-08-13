import "./style.css";
import "./costumDatGUI.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
// import Physics from "./Physics";
import Vector3 from "./Library";
class Physics {
  constructor(length, width, height, mass) {
    this.length = length;
    this.width = width;
    this.height = height;
    this.mass = mass;
    this.gravity = 9.81;
    this.position = new Vector3();
    this.velocity = new Vector3();
    this.accel = new Vector3();
    this.frontFaceForAir = this.calculateFrontFaceForAir();
    this.frontFaceForWater= this.calculateFrontFaceForWater();
    this.hsubmerged= this.getSubmergedHeight();
    this.airResist = 8;
    this.airDensity = 1.184;
    this.waterResist = 0.5;
    this.waterDensity = 1000;
    this.rpmRange = 500;

    this.enginForce = 10000;
    this.InputThrottle = 0.5;

    document.addEventListener("keydown", (event) => {
        if (event.key === "w") {
            if(this.InputThrottle<=1){
              this.InputThrottle+=0.1;
            }
        }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "s") {
          if(this.InputThrottle>=0){
            this.InputThrottle-=0.1;
          }
      }
  });

  //   document.addEventListener("keyup", (event) => {
  //     if (event.key === "W") {
  //         this.pushForce(0);
  //     }

  // });
  }

  // حساب الارتفاع المغمور بناءً على قوة الطفو
  
  getSubmergedHeight() {
    const volume = this.length * this.width * this.height;
    const buoyantForce = this.mass * this.gravity;
    const waterDensity = 1000; // كثافة الماء بالكيلوغرام/متر مكعب

    // حجم الجزء المغمور من القارب
    const submergedVolume = buoyantForce / (waterDensity * this.gravity);

    // ارتفاع الجزء المغمور من القارب
    const submergedHeight = submergedVolume / (this.length * this.width);
    console.log('submerged hieght'+submergedHeight)
    return submergedHeight;
  }

  updateParams(length, width, height, mass) {
    this.length = length;
    this.width = width;
    this.height = height;
    this.mass = mass;
  }

  isSinking() {
    const submergedHeight = this.getSubmergedHeight();
    return submergedHeight >= this.height;
  }
  //////////////2222222222222222/////////////////////

  update() {
    ///// Total force
    var totalF = this.totalForce();

    ///// ACCELERATION
    this.acceleration = totalF.divideScalar(this.mass);

    ///// Velocity 
    this.velocity = this.velocity.addVector(
        this.acceleration.clone().multiplyScalar(5)
    );
 
    ///// Position
    this.position = this.position.addVector(
        this.velocity.clone().multiplyScalar(5)
    );
  }

///////////////////// Total Force ///////////////
  totalForce() {
      var tf= new Vector3();
      tf = tf.addVector(this.pushForce()); 
      tf = tf.addVector(this.dragForce()); 
      // tf.z+=this.temp;
      console.log("totalForce: "+tf.x + ","+tf.y+" ,"+tf.z)
      return tf;
  }

  pushForce() {
    this.throttle = this.InputThrottle*this.enginForce;;
    var tractionForce = this.throttle;
    var tractionVector = new Vector3(tractionForce,0,0);
    return tractionVector;
    // return new Vector3(3000,0,0);
    // return pushVectorDir.multiplyScalar(pushValue);
}
  // pushForce() {
  //     var pushVectorValue = 50;
  //     var pushVectorDir = this.velocity.normalize();
  //     // return new Vector3(3000,0,0);
  //     return pushVectorDir.multiplyScalar(pushVectorValue);
  // }
  dragForce() {
      var F_drag = (this.airForce().addVector(this.waterForce()));
      // .multiplyScalar(-1) ;
      return F_drag;
  }

  calculateFrontFaceForAir() {
      var ft = this.width * (this.height - this.hsubmerged);
      return ft;
  }

  calculateFrontFaceForWater(){
    var ft = this.width*this.hsubmerged; 
    return ft;
  }

  airForce() {
      var airValue = 0.5 * (this.frontFaceForAir * this.airResist * this.airDensity * this.velocity.length() * this.velocity.length());
      // var airDir = this.velocity.normalize();
      var airDir = new Vector3(airValue,0,0);
      // return airDir.multiplyScalar(airValue);
      return airDir;
  }

  waterForce() {
      var waterValue = 0.5 * (this.frontFaceForWater * this.waterResist * this.waterDensity * this.velocity.length() * this.velocity.length());
      var waterDir = new Vector3(waterValue,0,0);
      // var waterDir = this.velocity.normalize();
      // var waterDir = new Vector3(waterValue,0,0);
      // return waterDir.multiplyScalar(waterValue);
      return waterDir;
      // return waterDir;
    }

  
}


export default Physics;
