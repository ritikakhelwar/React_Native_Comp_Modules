import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import FaceSDK, {
  Enum,
  FaceCaptureResponse,
  MatchFacesResponse,
  MatchFacesRequest,
  MatchFacesImage,
  MatchFacesSimilarityThresholdSplit,
} from '@regulaforensics/react-native-face-api';

import FaceDetection, {
  FaceDetectorContourMode,
  FaceDetectorLandmarkMode,
} from 'react-native-face-detection';

import ButtonComponent from './ButtonComponent';
import RNFetchBlob from 'rn-fetch-blob';
import Loader from './Loader';
import { getImageUrl, showError } from '../utils/helperFunctions';
import { moderateScale, textScale } from '../styles/responsiveSize';
import commonStyles from '../styles/commonStyles';
import colors from '../styles/colors';
import imagePathLocal from '../constants/imagePath';
import fontFamily from '../styles/fontFamily';
import RNFS from 'react-native-fs';

const image1 = new MatchFacesImage();
const image2 = new MatchFacesImage();
let request = null;

const FaceVerificationComp = ({ faceVerifiedSuccess = () => { }, closeModal=()=>{} }) => {
  const fs = RNFetchBlob.fs;
  let imagePath = null;

  const userData = useSelector(state => state?.auth?.userData);
  const [isLoading, setIsLoading] = useState(true);
  const [myUploadedPic, setMyUploadedPic] = useState(null);
  const [scannedImage, setScannedImage] = useState(null);
  const [similarity, setSimilarity] = useState('');
  const [matchPercentage, setMatchPercentage] = useState('');
  const [profileMatched, setProfileMatched] = useState(false);
  const [profileDeclined, setProfileDeclined] = useState(false);

  console.log(userData, 'userDatauserDatauserData');
  const myProfilePic = userData?.profile_picture_url
    ? userData?.profile_picture_url
    : getImageUrl(
      userData?.source?.proxy_url,
      userData?.source?.image_path,
      '200/200',
    );

  const _faceVerifiedSuccess = async () => {
    const fileName = `${Date.now()}.png`;
    const dirs = RNFetchBlob.fs.dirs
    console.log('scannedImage', scannedImage)
    const path = `${dirs.DocumentDir}/${fileName}`;
    // write base64 data to file
    RNFetchBlob.fs.writeFile(path, scannedImage?.base64Data, 'base64')
      .then((res) => {
        console.log('res', res)
        const image = {
          uri: Platform.OS == 'ios' ? path : 'file://' + path,
          name: fileName,
          type: 'image/png',
        };

        //  return image
        faceVerifiedSuccess(matchPercentage, image);
      })
    // await RNFS.writeFile(path, scannedImage, 'base64');


  };

  useEffect(() => {
    _getBase64();
  }, []);

  useEffect(() => {
    if (scannedImage?.uri) {
      _matchFaces();
    }
  }, [scannedImage]);

  const _matchFaces = () => {
    console.log("MatchFace", image1, image2)
    if (
      image1 == null ||
      image1.bitmap == null ||
      image1.bitmap === '' ||
      image2 == null ||
      image2.bitmap == null ||
      image2.bitmap === ''
    ) {
      return;
    }
    // setStartVerification(true);
    setSimilarity('Processing...');
    request = new MatchFacesRequest();
    request.images = [image1, image2];
    FaceSDK.matchFaces(
      JSON.stringify(request),
      response => {
        response = MatchFacesResponse.fromJson(JSON.parse(response));
        console.log(JSON.stringify(response), 'helllo response --->>>>>>>>.');
        if (JSON.stringify(response)?.includes('Face not detected on image.')) {
          setSimilarity('Sorry, Face not detected on image!!');
          setProfileDeclined(true);
          // setStartVerification(false);
          setProfileMatched(false);
          // lottieRefDecline.current.play()
          return;
        }
        FaceSDK.matchFacesSimilarityThresholdSplit(
          JSON.stringify(response.results),
          0.75,
          str => {
            console.log(str, 'aslksjalkasdslakjsdalk');
            const split = MatchFacesSimilarityThresholdSplit.fromJson(
              JSON.parse(str),
            );
            console.log(split, 'split ===========>>>>>>>>>>>>>>>>>');
            if (split?.matchedFaces?.length > 0) {
              const matchPercentage = (
                split.matchedFaces[0].similarity * 100
              ).toFixed(2);
              setSimilarity(
                'Congrats! The image matched by ' + matchPercentage + '%',
              );
              setMatchPercentage(matchPercentage)
              if (matchPercentage > 40) {
                setProfileMatched(true);
                setProfileDeclined(false);
                // lottieRef.current.play()
              }
              // setStartVerification(false);
            } else if (split?.unmatchedFaces?.length > 0) {
              setSimilarity('Sorry, the image doesn`t matched');
              setProfileMatched(false);
              setProfileDeclined(true);
              // setStartVerification(false);
              // lottieRefDecline.current.play()
            } else {
              setSimilarity('Sorry, the image doesn`t matched');
              setProfileMatched(false);
              setProfileDeclined(true);
              // setStartVerification(false);
              // lottieRefDecline.current.play()
            }
          },
          e => {
            setSimilarity(e);
            setProfileDeclined(true);
            // setStartVerification(false);
            setProfileMatched(false);
            // lottieRefDecline.current.play()
          },
        );
      },
      e => {
        setSimilarity(e);
        setProfileDeclined(true);
        // setStartVerification(false);
        setProfileMatched(false);
        // lottieRefDecline.current.play()
      },
    );
  };

  const _getBase64 = () => {
    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', myProfilePic)
      .then(resp => {
        setIsLoading(false);
        imagePath = resp.path();
        return resp.readFile('base64');
      })
      .then(base64Data => {
        setIsLoading(false);
        console.log(base64Data, 'Base64');
        image1.bitmap = base64Data;
        image1.imageType = Enum.ImageType.PRINTED;
        setMyUploadedPic(true, base64Data, Enum.ImageType.PRINTED);
        return fs.unlink(imagePath);
      })
      .catch(error => {
        showError('Failed to get Base64 of url.');
        console.log('Base64 error-->', error);
        setIsLoading(false);
      });
  };

  const _startFaceVerify = () => {
    console.log('resresres');
    // closeModal(false)
    FaceSDK.presentFaceCaptureActivity(
      result => {
        const res = JSON.parse(result);
        console.log(res, 'resresres');
        if (res?.exception?.message == 'Cancelled by user.') {
          return setIsLoading(false);
        }
        let verifiedImage = FaceCaptureResponse.fromJson(JSON.parse(result))?.image?.bitmap;
        image2.bitmap = verifiedImage
        image2.imageType = Enum.ImageType.LIVE;
        setScannedImage({
          uri:
            'data:image/png;base64,' + verifiedImage,
          base64Data: verifiedImage
          // FaceCaptureResponse.fromJson(JSON.parse(result)).image.bitmap,
        });
        // setTimeout(() => {
        //   closeModal(true)
        // },500)
      },
      e => { },
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: .85 }}>
        <View
          style={{
            flex: 0.4,
            padding: moderateScale(20),
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: moderateScale(20),
          }}>
          {scannedImage ? (
            <Image
              style={{
                height: '100%',
                width: '100%',
                borderRadius: moderateScale(70),
                backgroundColor: colors.white,
              }}
              borderRadius={moderateScale(60)}
              source={scannedImage}
              resizeMode={'contain'}/>
            
          ) : (
            <TouchableOpacity
              style={{
                height: moderateScale(120),
                width: moderateScale(120),
                borderRadius: moderateScale(60),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.white,
              }}>
              <Image
                source={
                  myProfilePic ? { uri: myProfilePic } : imagePathLocal?.icProfile
                }
                style={{
                  height: moderateScale(120),
                  width: moderateScale(120),
                  borderRadius: moderateScale(60),
                }}
              />
            </TouchableOpacity>
          )}
        </View>
        {similarity ? (
          <View
            style={{
              backgroundColor: colors.white,
              padding: moderateScale(16),
              borderRadius: moderateScale(16),
            }}>
            <Text
              style={{
                fontSize: textScale(16),
                fontFamily: fontFamily?.bold,
                color: colors.black,
                textAlign: 'center',
              }}>
              Matching:
            </Text>
            <Text
              style={{
                fontSize: textScale(14),
                fontFamily: fontFamily?.medium,
                color: colors.blackOpacity70,
                textAlign: 'center',
                marginTop: moderateScale(6),
              }}>
              {similarity}
            </Text>
          </View>
        ) : (
          <></>
        )}
      </View>
      <View style={{ flex: 0.1 }}>
        {profileMatched ? (
          <ButtonComponent
            buttonTitle={'Proceed'}
            onPress={() => {
              _faceVerifiedSuccess(true);
            }}
          />
        ) : (
          <>
            {similarity == 'Processing...' ? (
              <></>
            ) : (
              <ButtonComponent
                buttonTitle={profileDeclined ? 'Re-verify' : 'Verify your face'}
                onPress={() => _startFaceVerify()}
              />
            )}
            {profileDeclined && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: moderateScale(14),
                }}>
                <Text style={{}}>Failed to verify account?</Text>
              </View>
            )}
          </>
        )}
        {/* <ButtonComponent
                    btnText={"Face Verify"}
                    onPress={_startFaceVerify}
                /> */}
      </View>

      <Loader isLoading={isLoading} />
    </View>
  );
};

export default FaceVerificationComp;
