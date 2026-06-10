import React, { useEffect, useRef } from "react";
import { H5P } from "h5p-standalone";

function H5Player({ h5pJsonPath, lesson_id, markLessonCompleted }) {
  const h5pContainerRef = useRef(null);

  useEffect(() => {
    const loadH5P = async () => {
      if (h5pContainerRef.current) {
        // Clear previous H5P content
        h5pContainerRef.current.innerHTML = '';

        const saveFunction = () => {
          console.log("saving state...")
        }

        const options = {
          h5pJsonPath: h5pJsonPath,
          frameJs: "/h5p/dist/frame.bundle.js",
          frameCss: "/h5p/dist/styles/h5p.css",
          frame: false,
          export: true,
          // contentUserData: "",
          saveFreq: 10,   // means 10 seconds
          saveFunctionCallback: saveFunction, // the function i need to run after every 10 secs
          // ajax: {
          //   setFinishedUrl: "string",
          //   contentUserDataUrl: "string",
          // },
        };

        const h5pInstance = await new H5P(h5pContainerRef.current, options); // Load new H5P content

        // Attach event handler after H5P content is fully loaded
        if (h5pInstance && window.H5P && window.H5P.externalDispatcher) {
          window.H5P.externalDispatcher.on('xAPI', eventHandler);
        }
      }
    };


    loadH5P();

    return () => {
      if (h5pContainerRef.current) {
        h5pContainerRef.current.innerHTML = '';
      }
    };
  }, [h5pJsonPath]); // Add h5pJsonPath as a dependency

  useEffect(() => {
    const attachEventHandler = () => {
      if (window.H5P && window.H5P.externalDispatcher) {
        window.H5P.externalDispatcher.on('xAPI', eventHandler);
      } else {
        // Retry after some time if H5P.externalDispatcher is not available yet
        setTimeout(attachEventHandler, 1000);
      }
    };

    attachEventHandler();

    return () => {
      if (window.H5P && window.H5P.externalDispatcher) {
        window.H5P.externalDispatcher.off('xAPI', eventHandler);
      }
    };
  }, []);

  const eventHandler = async (event) => {
    console.log('xAPI event:', event);
    if (event.data?.statement?.result?.completion && event.data?.statement?.result?.success === undefined) {
      console.log('Video completed');
      // console.log('Result (Score)', event.data?.statement?.result);
      await markLessonCompleted(lesson_id);
    }
  };

  return (
    <div className="w-full" ref={h5pContainerRef} id='h5p-container'></div>
  );
}

export default H5Player;