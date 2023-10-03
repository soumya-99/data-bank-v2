import {
  StyleSheet,
  Text,
  View,
  PixelRatio,
  ScrollView,
  RefreshControl,
} from "react-native"
import { StackActions, useFocusEffect } from "@react-navigation/native"
import { useState, useEffect, useContext, useCallback } from "react"
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer"

import { Table, Rows } from "react-native-table-component"
import { COLORS, colors } from "../../Resources/colors"
import CustomHeader from "../../Components/CustomHeader"
import { AppStore } from "../../Context/AppContext"
import { Button } from "react-native"
// import { useIsFocused } from '@react-navigation/native';
const Home = ({ navigation }) => {
  const {
    userId,
    agentName,
    bankName,
    branchName,
    totalCollection,
    getTotalDepositAmount,
    login,
  } = useContext(AppStore)

  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  let tableData = [
    ["Bank", bankName],
    ["Branch", branchName],
    ["Agent Code", userId],
    ["Agent Name", agentName],
    ["Date", currentDateTime.toLocaleDateString("en-GB")],
    ["Time", currentDateTime.toLocaleTimeString("en-GB")],
    ["Total Collection", totalCollection.toFixed(2)],
  ]

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    getTotalDepositAmount()
    setTimeout(() => {
      setRefreshing(false)
      login()
    }, 2000)
  }, [])

  const popAction = StackActions.popToTop()

  useFocusEffect(
    useCallback(() => {
      // alert('Screen was focused')
      setRefreshing(true)
      getTotalDepositAmount()
      setTimeout(() => {
        setRefreshing(false)
        login()
      }, 2000)

      navigation.dispatch(popAction)

      return () => {
        // alert('Screen was unfocused')
        // // Useful for cleanup functions
      }
    }, []),
  )

  async function printAgentInfo() {
    const columnWidths = [24, 24]
    const receiptNo = 120
    const receiptDate = new Date().toLocaleDateString("en-GB")
    const originalAccount = "1239"
    const branch = "Bhaglapur Branch"
    const telephone = "123-456-7890"
    const salesman = "Soumyadeep Mondal"
    const productCode = "P123"
    const amount = "500.00"
    const discount = "50.00"
    const amountReceived = "450.00"
    const paymentMethod = "Credit Card"
    const receivedFrom = "Amit Mondal"
    const fcuser = "Tanmoy Mondal"
    const collectionRecieptNo = 121

    try {
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER,
      )
      await BluetoothEscposPrinter.printText("Data Bank", { align: "center" })
      await BluetoothEscposPrinter.printText("\r\n", {})

      await BluetoothEscposPrinter.printText(
        collectionRecieptNo + " AGENT INFO",
        {},
      )

      await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Receipt No: " + receiptNo],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Receipt Date: " + receiptDate],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Original A/C:" + originalAccount],
        {},
      )

      await BluetoothEscposPrinter.printText("\r\n", {})

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Branch:" + branch],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Telephone:" + telephone],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Salesman:" + salesman],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Product Code:" + productCode],
        {},
      )

      await BluetoothEscposPrinter.printText("\r\n", {})

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Amount:" + amount + "/="],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Discount:" + discount + "/="],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Amount Received:" + amountReceived + "/="],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Payment Method:" + paymentMethod],
        {},
      )

      await BluetoothEscposPrinter.printText("\r\n", {})

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Received From:" + receivedFrom],
        {},
      )

      await BluetoothEscposPrinter.printText("\r\n", {})

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Signature:" + "..................."],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        [48],
        [BluetoothEscposPrinter.ALIGN.LEFT],
        ["Printed By:" + fcuser],
        {},
      )

      await BluetoothEscposPrinter.printText("\r\n", {})
      // await BluetoothEscposPrinter.printQRCode("Something", 25, 3)
    } catch (e) {
      alert(e.message || "ERROR")
    }
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <CustomHeader />

        <View style={styles.logoContainer}>
          <View style={{ width: "100%" }}>
            {/* Welcome gretting */}
            <Text style={styles.grettingText}>Welcome To {"Data Bank"}</Text>
            {/* manual text */}
            <Text style={styles.manual}>Hello, {agentName}</Text>
          </View>
        </View>

        <View
          style={{
            flex: 4,
            padding: 10,
            backgroundColor: COLORS.lightScheme.background,
            margin: 20,
            borderRadius: 10,
          }}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <Text style={styles.todayCollection}>Agent Information</Text>
            <Table
              borderStyle={{
                borderWidth: 2,
                borderColor: COLORS.lightScheme.onTertiaryContainer,
                borderRadius: 10,
              }}
              style={{
                backgroundColor: COLORS.lightScheme.background,
              }}>
              <Rows data={tableData} textStyle={styles.text} />
            </Table>
          </ScrollView>
          <View>
            <Button title="Print" onPress={printAgentInfo} />
          </View>
        </View>
      </View>
    </>
  )
}

export default Home

const styles = StyleSheet.create({
  head: { height: 40, backgroundColor: "#f1f8ff" },
  text: {
    margin: 6,
    color: COLORS.lightScheme.onTertiaryContainer,
    fontWeight: "400",
    fontSize: 18,
  },
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
    fontSize: 20,
    color: COLORS.lightScheme.onSecondaryContainer,
    letterSpacing: 1,
    fontWeight: "900",
    alignSelf: "center",
  },
  manual: {
    fontSize: 16,
    color: COLORS.lightScheme.primary,
    letterSpacing: 1,
    fontWeight: "900",
    alignSelf: "center",
  },
  todayCollection: {
    backgroundColor: COLORS.lightScheme.primary,
    color: COLORS.lightScheme.onPrimary,
    fontWeight: "600",
    textAlign: "center",
    fontSize: PixelRatio.roundToNearestPixel(22),
    padding: PixelRatio.roundToNearestPixel(5),
    marginBottom: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
})
