// 0. Install fingerpose: npm install fingerpose https://www.npmjs.com/package/fingerpose
// 1. Add Use State
// 2. Import emojis and finger pose import * as fp from "fingerpose";
// 3. Setup hook and emoji object
// 4. Update detect function for gesture handling
// 5. Add emoji display to the screen

///////// NEW STUFF ADDED USE STATE
import React, { useRef, useState, useEffect } from "react";
///////// NEW STUFF ADDED USE STATE

// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";

///////// NEW STUFF IMPORTS
import * as fp from "fingerpose";
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png";
import pointing from "./pointing.png";
import palma from "./palma.png"
import ok from "./ok.png"
///////// NEW STUFF IMPORTS

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  ///////// NEW STUFF ADDED STATE HOOK
  const [emoji, setEmoji] = useState(null);
  const images = { thumbs_up: thumbs_up, victory: victory, pointing: pointing, ok: ok, palma: palma };
  ///////// NEW STUFF ADDED STATE HOOK

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      // console.log(hand);

      //
      //Crear otro gesto pointing
      //
      const PointingGesture = new fp.GestureDescription('pointing');
      PointingGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 0.85);
      // PointingGesture.addCurl(fp.Finger.Index, fp.FingerCurl.HalfCurl,0.5);
      PointingGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 0.95);
      // PointingGesture.addDirection(fp.Finger.Index, fp.FingerDirection.DiagonalUpRight, 0.9);
      // PointingGesture.addDirection(fp.Finger.Index, fp.FingerDirection.DiagonalUpLeft, 0.9);
      for (let finger of [fp.Finger.Thumb, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
        PointingGesture.addCurl(finger, fp.FingerCurl.FullCurl, 0.85);
        PointingGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 1.0);
      }

      //Gesto palma

      const Palma = new fp.GestureDescription('palma')


      for (let finger of [
        fp.Finger.Thumb,
        fp.Finger.Index,
        fp.Finger.Middle,
        fp.Finger.Ring,
        fp.Finger.Pinky
      ]) {

        Palma.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
      }
      for (let finger of [
        fp.Finger.Index,
        fp.Finger.Middle,
        fp.Finger.Ring,
        fp.Finger.Pinky
      ]) {

        Palma.addDirection(finger, fp.FingerDirection.VerticalUp, 0.95);
        Palma.addDirection(finger, fp.FingerDirection.DiagonalUpLeft, 0.2);
        Palma.addDirection(finger, fp.FingerDirection.DiagonalUpRight, 0.2);
      }

      // Thumb
      Palma.addDirection(fp.Finger.Thumb, fp.FingerDirection.HorizontalRight, 0.5);
      Palma.addDirection(fp.Finger.Thumb, fp.FingerDirection.HorizontalLeft, 0.5);



      //Gesto ok

      const Ok = new fp.GestureDescription('ok')

      // thumb:
      Ok.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
      Ok.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpRight, .75);

      // index:
      Ok.addCurl(fp.Finger.Index, fp.FingerCurl.HalfCurl, 1.0);
      Ok.addDirection(fp.Finger.Index, fp.FingerDirection.DiagonalUpRight, .75);

      // Middle:
      Ok.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
      Ok.addDirection(fp.Finger.Middle, fp.FingerDirection.DiagonalUpRight, .75);


      // Ring:
      Ok.addCurl(fp.Finger.Ring, fp.FingerCurl.NoCurl, 1.0);
      Ok.addDirection(fp.Finger.Ring, fp.FingerDirection.VerticalUp, .75);


      // Pinky:
      Ok.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
      Ok.addDirection(fp.Finger.Pinky, fp.FingerDirection.VerticalUp, .75);


      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
          PointingGesture,
          Ok,
          Palma
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          console.log(gesture.gestures);

          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          console.log(gesture.gestures[maxConfidence].name);
          setEmoji(gesture.gestures[maxConfidence].name);
          console.log(emoji);
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  useEffect(() => { runHandpose() }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        {/* NEW STUFF */}
        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
            }}
          />
        ) : (
          ""
        )}

        {/* NEW STUFF */}
      </header>
    </div>
  );
}

export default App;
