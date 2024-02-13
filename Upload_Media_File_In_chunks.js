import React from 'react';
import {StyleSheet} from 'react-native';
import * as tus from 'tus-js-client';
import ButtonComp from '../../Components/ButtonComp';
import WrapperContainer from '../../Components/WrapperContainer';
import {TUS_URL} from '../../config/urls';

interface ReelsTabProps {}

const ReelsTab: React.FC<ReelsTabProps> = () => {


  const selectSingleImageFromGallery = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const imagePickerOptions = {
        // compressImageQuality: 0.4,
        mediaType: 'video',
        // width: 300,
        // height: 300,
        // multiple: false,
        // cropping: true,
      };
      const pickedImage = await ImagePicker.openPicker(imagePickerOptions);
      resolve(pickedImage);
    } catch (error) {
      reject(error);
      console.log('Image Picker Error: ', error);
    }
  });
};
  
  const uploadMediaInChunks = (value) => {
    // Create a new tus upload
    const file = {...value, uri: value?.path};
    console.log('Im here', file);
    var upload = new tus.Upload(file, {
      endpoint: TUS_URL,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.filename,
        filetype: file.mime,
      },
      onError: function (error) {
        console.log('Failed because: ' + error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + '%');
      },
      onSuccess: function (res) {
        console.log('Download %s from %s', upload.file.name, upload.url);
      },
    });
    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then(function (previousUploads) {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      // Start the upload
      upload.start();
    });
  };

  const _selectImg = () => {
    selectSingleImageFromGallery()
      .then(res => {
        // console.log('selectSingleImageFromGallery ?res-->', res);
        uploadMediaInChunks(res);
      })
      .catch(err => {
        console.log('selectSingleImageFromGallery err-->', err);
      });
  };

  return (
    <WrapperContainer>
      <ButtonComp onPress={_selectImg} />
    </WrapperContainer>
  );
};

export default ReelsTab;

const styles = StyleSheet.create({});

