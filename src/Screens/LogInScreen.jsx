import {
  StyleSheet,
  Text,
  View,
  PixelRatio,
  TouchableOpacity,
  Image,
  ToastAndroid,
  Alert,
  Linking,
} from "react-native"
import { useState, useEffect, useContext, useCallback } from "react"
import { COLORS, colors } from "../Resources/colors"
import InputComponent from "../Components/InputComponent"
import { Strings } from "../Resources/Strings"
import ButtonComponent from "../Components/ButtonComponent"
import mainNavigationRoutes from "../Routes/NavigationRoutes"
import { AppStore } from "../Context/AppContext"
import SmoothPinCodeInput from "react-native-smooth-pincode-input"
import HeaderImage from "../Resources/Images/logo_cut.png"
import { useFocusEffect } from "@react-navigation/native"
import DeviceInfo from "react-native-device-info"
import axios from "axios"
import { address } from "../Routes/addresses"

const LogInScreen = ({ navigation }) => {
  const {
    isLogin,
    login,
    userId,
    agentName,
    getUserId,
    deviceId,
    setDeviceId,
    passcode,
    setPasscode,
    next,
    setNext,
  } = useContext(AppStore)

  const [latestAppVersion, setLatestAppVersion] = useState("")
  const [appDownloadLink, setAppDownloadLink] = useState("")
  const [updateStatus, setUpdateStatus] = useState("")

  useEffect(() => {
    console.log(passcode)
  }, [passcode])

  const handlePressOnFirstScreen = () => {
    if (userId) {
      setNext(true)
    } else {
      setNext(false)
      ToastAndroid.showWithGravityAndOffset(
        "We encountered some error on server.",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
        25,
        50,
      )
    }
  }

  let version = DeviceInfo.getVersion()

  const [latestMajor, latestMinor, latestPatch] = latestAppVersion
    .split(".")
    .map(s => parseInt(s, 10))
  const [currentMajor, currentMinor, currentPatch] = version
    .split(".")
    .map(s => parseInt(s, 10))

  const getVersionFromWeb = async () => {
    await axios
      .post(
        address.GET_VERSION_DETAILS,
        { app_version: version },
        {
          headers: {
            Accept: "application/json",
          },
        },
      )
      .then(res => {
        setLatestAppVersion(res.data.data.app_version)
        setAppDownloadLink(res.data.data.app_download_link)
        console.log(
          "fsdadgtreyhgtdhyrfujfyudx",
          res.data.data.app_download_link,
        )
        setUpdateStatus(res.data.update_status)

        if (res.data.update_status == "Y") {
          showAlertUpdate(res.data.data.app_download_link)
        }
      })
  }

  useEffect(() => {
    getUserId()
    getVersionFromWeb()
  }, [])

  console.log("skahlrcnsfytkuwhnf ", version)
  console.log("skahlrcnsfytkuwhnf ", latestAppVersion)
  console.log("skahlrcnsfytkuwhnf ", updateStatus)

  function showAlertUpdate(link) {
    Alert.alert("Found Update!", "Please update your app.", [
      { text: "Download", onPress: () => Linking.openURL(link) },
    ])
  }

  // 1 3 0 ========= 1 1 0

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightScheme.background }}>
      <View style={styles.logoContainer}>
        <Image source={HeaderImage} style={styles.image} resizeMode="contain" />
        <View>
          {/* Wellcome gretting */}
          <Text style={styles.grettingText}>Welcome to {"Data Bank"}</Text>
          {/* manual text */}
          <Text style={styles.manual}>Login with your pin</Text>
        </View>
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.logINcontainer}>
          {/* Title */}
          <Text style={styles.title}>LOGIN</Text>

          {!next && (
            <View>
              {/* DeviceId */}
              {!userId && (
                <InputComponent
                  // handleChange={() => { }}
                  value={deviceId ? deviceId : "Fetching ID..."}
                  placeholder={Strings.loginPlaceHolder}
                  label={"Device ID"}
                  readOnly={true}
                />
              )}
              {/* Agent ID */}
              <InputComponent
                // handleChange={handlePressOnFirstScreen}
                value={userId ? userId : "Fetching ID..."}
                placeholder={`${userId}`}
                label={"Agent ID"}
                readOnly={true}
              />
              {/* <InputComponent
                // handleChange={handlePressOnFirstScreen}
                value={agentName ? agentName : "Fetching Username..."}
                placeholder={`${agentName}`}
                label={'Agent Name'}
                readOnly={true}
              /> */}

              <View style={styles.buttonContainer}>
                <ButtonComponent
                  disabled={updateStatus == "Y" ? true : false}
                  title={"Next"}
                  handleOnpress={() => handlePressOnFirstScreen()}
                  customStyle={{ width: "80%" }}
                />
              </View>

              {/* {updateStatus && (
                <View style={styles.buttonContainer}>
                  <ButtonComponent
                    title={"Download Update"}
                    handleOnpress={() => {
                      showAlertUpdate()
                    }}
                    customStyle={{ width: "80%" }}
                  />
                </View>
              )} */}
            </View>
          )}

          {next && (
            <View>
              {/* Passcode */}
              <View style={{ padding: 10, alignItems: "center" }}>
                <SmoothPinCodeInput
                  autoFocus={true}
                  placeholder="?"
                  mask={
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 25,
                        backgroundColor: COLORS.lightScheme.primary,
                      }}></View>
                  }
                  maskDelay={1000}
                  password={true}
                  cellStyle={{
                    borderWidth: 1,
                    borderRadius: 5,
                    borderColor: COLORS.lightScheme.secondary,
                  }}
                  cellStyleFocused={null}
                  value={passcode}
                  onTextChange={code => setPasscode(code)}
                  onBackspace={() => {
                    console.warn("hello")
                  }}
                />
              </View>

              {/* Forgot Pin */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(mainNavigationRoutes.forgotPasscode)
                }>
                <Text style={styles.resetText}>Forgot Pin?</Text>
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <ButtonComponent
                  title={"Back"}
                  handleOnpress={() => {
                    setNext(!next)
                  }}
                  customStyle={{
                    marginTop: 10,
                    backgroundColor: COLORS.lightScheme.error,
                    width: "40%",
                  }}
                />
                <ButtonComponent
                  title={"Submit"}
                  handleOnpress={() => {
                    login()
                    console.log(isLogin)
                  }}
                  customStyle={{ marginTop: 10, width: "40%" }}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default LogInScreen

const styles = StyleSheet.create({
  logoContainer: {
    flex: 2,
    backgroundColor: COLORS.lightScheme.secondaryContainer,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  grettingText: {
    fontSize: 18,
    color: COLORS.lightScheme.onSecondaryContainer,
    letterSpacing: 1,
    fontWeight: "900",
  },
  manual: {
    fontSize: 14,
    color: COLORS.lightScheme.primary,
    letterSpacing: 1,
    fontWeight: "900",
    alignSelf: "center",
  },

  mainContainer: {
    flex: 4,
  },
  logINcontainer: {
    width: "100%",
    backgroundColor: COLORS.lightScheme.background,

    padding: PixelRatio.roundToNearestPixel(10),
    borderRadius: PixelRatio.roundToNearestPixel(10),
    shadowColor: COLORS.lightScheme.onTertiaryContainer,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
    position: "absolute",
    bottom: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.lightScheme.tertiaryContainer,
    // alignSelf: 'center',
    letterSpacing: 4,
    backgroundColor: COLORS.lightScheme.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderTopLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  buttonContainer: {
    width: "100px",
    marginVertical: 5,
    padding: 5,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  resetText: {
    textAlign: "center",
    color: COLORS.lightScheme.onTertiaryContainer,
    fontSize: 16,
    alignSelf: "flex-end",
    paddingHorizontal: 6,
    letterSpacing: 1,
    marginTop: 10,
    fontWeight: "700",
  },
  image: {
    width: 80,
    height: 50,
  },
})
