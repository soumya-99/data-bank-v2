import { useContext, useEffect, useState } from "react"
import {
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer"
import { AppStore } from "../../Context/AppContext"
import CustomHeader from "../../Components/CustomHeader"
import { COLORS } from "../../Resources/colors"
import { Table, Rows, Row, Col } from "react-native-table-component"
import axios from "axios"
import CalendarPicker from "react-native-calendar-picker"
import { address } from "../../Routes/addresses"
import { icon } from "../../Resources/Icons"

const DuplicateReceiptInner = ({ route }) => {
  const { item } = route.params

  const { userId, bankId, branchCode, bankName, branchName, agentName } =
    useContext(AppStore)

  const [duplicateReceipts, setDuplicateReceipts] = useState(() => [])
  const [totalAmount, setTotalAmount] = useState(() => 0)

  const [loading, setLoading] = useState(() => true)

  const tableHead = ["Date", "Rcpt No", "Dep Amt", "Print"]
  let tableData = duplicateReceipts

  const getDuplicateReceipts = async () => {
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      account_number: item?.account_number,
    }

    await axios
      .post(address.DUPLICATE_RECEIPT, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
        res.data.success.msg.forEach((item, i) => {
          let rowArr = [
            new Date(item.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }),
            item.receipt_no,
            item.deposit_amount,
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Print Duplicate",
                  "Are you sure you want to Print?",
                  [
                    {
                      text: "No",
                      onPress: () => console.log("Cancel Pressed"),
                    },
                    {
                      text: "Print",
                      onPress: () =>
                        printReceipt(
                          item.receipt_no,
                          item.date,
                          item.account_holder_name,
                          item.account_number,
                          item.account_type,
                          item.deposit_amount,
                        ),
                    },
                  ],
                )
              }}
              style={styles.dateButton}>
              {icon.printer(COLORS.lightScheme.primary, 20)}
            </TouchableOpacity>,
          ]
          console.log("ITEMMM TABLEEE=====", rowArr)
          tableData.push(...[rowArr])

          setLoading(false)
        })

        console.log("++++++ TABLE DATA ++++++++", tableData)
        setDuplicateReceipts(tableData)
      })
      .catch(err => {
        ToastAndroid.showWithGravityAndOffset(
          "Error occurred in the server",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
          25,
          50,
        )
        console.log(err)
      })
  }

  async function printReceipt(
    rcptNo,
    date,
    accHolderName,
    accNumber,
    accType,
    depAmt,
  ) {
    try {
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER,
      )
      await BluetoothEscposPrinter.printText(bankName, { align: "center" })
      await BluetoothEscposPrinter.printText("\r\n", {})
      await BluetoothEscposPrinter.printText(branchName, { align: "center" })
      await BluetoothEscposPrinter.printText("\r\n", {})

      await BluetoothEscposPrinter.printText("DUPLICATE RECEIPT", {
        align: "center",
      })

      await BluetoothEscposPrinter.printText("\r", {})

      // await BluetoothEscposPrinter.printPic(logo, { width: 300, align: "center", left: 30 })

      await BluetoothEscposPrinter.printText(
        "-------------------------------",
        {},
      )
      await BluetoothEscposPrinter.printText("\r\n", {})

      let columnWidths = [11, 1, 18]

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["AGENT NAME", ":", agentName.toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          "RCPT DATE",
          ":",
          (
            new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }) +
            ", " +
            new Date(date).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          ).toString(),
        ],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["RCPT NO", ":", rcptNo.toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["ACC NO", ":", accNumber.toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["NAME", ":", accHolderName.toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["COLL AMT", ":", depAmt.toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          "ACC TYPE",
          ":",
          accType == "D"
            ? "Daily"
            : accType == "R"
            ? "RD"
            : accType == "L"
            ? "Loan"
            : "",
        ],
        {},
      )
      await BluetoothEscposPrinter.printText(
        "---------------X---------------",
        {},
      )

      await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
    } catch (e) {
      console.log(e.message || "ERROR")
      ToastAndroid.showWithGravityAndOffset(
        "Printer not connected.",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
        25,
        50,
      )
    }
  }

  // const handleSubmit = () => {
  //   tableData = []
  //   getDuplicateReceipts()
  // }

  useEffect(() => {
    tableData = []
    getDuplicateReceipts()
  }, [])

  console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", tableData)
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader />
      <View
        style={{
          flex: 4,
          padding: 10,
          backgroundColor: COLORS.lightScheme.background,
          margin: 20,
          borderRadius: 10,
        }}>
        <Text style={styles.todayCollection}>Duplicate Receipts</Text>
        <ScrollView>
          {tableData && (
            <Table
              borderStyle={{
                borderWidth: 2,
                borderColor: COLORS.lightScheme.secondary,
                borderRadius: 10,
              }}
              style={{ backgroundColor: COLORS.lightScheme.background }}>
              <Row data={tableHead} textStyle={styles.head} />

              {loading ? (
                <ActivityIndicator animating={true} />
              ) : (
                <Rows data={tableData} textStyle={styles.text} />
              )}
            </Table>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default DuplicateReceiptInner

const styles = StyleSheet.create({
  dateWrapper: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    margin: 20,
  },
  dateButton: {
    width: "40%",
    height: 40,
    borderWidth: 2,
    borderColor: COLORS.lightScheme.outline,
    backgroundColor: COLORS.lightScheme.tertiaryContainer,
    margin: 15,
    borderRadius: 10,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    margin: 6,
    color: COLORS.lightScheme.onBackground,
    fontWeight: "400",
    fontSize: 10,
  },
  accountDetailsStyle: {
    margin: 6,
    color: COLORS.lightScheme.primary,
    fontWeight: "bold",
    fontSize: 20,
  },
  head: {
    margin: 6,
    color: COLORS.lightScheme.onBackground,
    fontWeight: "900",
    fontSize: 10,
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
