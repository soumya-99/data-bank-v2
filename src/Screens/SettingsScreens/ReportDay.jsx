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
} from "react-native"
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer"
import { AppStore } from "../../Context/AppContext"
import CustomHeader from "../../Components/CustomHeader"
import { COLORS, colors } from "../../Resources/colors"
import { Table, Rows, Row } from "react-native-table-component"
import axios from "axios"
import { REACT_APP_BASE_URL } from "../../Config/config"
import CalendarPicker from "react-native-calendar-picker"
import { address } from "../../Routes/addresses"
import { removeIndexes } from "../../Functions/removeIndexes"

const ReportDay = () => {
  const { userId, bankId, branchCode, agentName, bankName, branchName } = useContext(AppStore)

  // const [startingDate, setStartingDate] = useState(() => "From Date") // date in yyyy-mm-dd
  // const [endingDate, setEndingDate] = useState(() => "To Date") // date in yyyy-mm-dd

  const [selectedStartDate, setSelectedStartDate] = useState(() => new Date())
  const [selectedEndDate, setSelectedEndDate] = useState(() => new Date())

  const [showModal, setShowModal] = useState(() => false)

  // const [isStartingDatePickerVisible, setIsStartingDatePickerVisible] = useState(() => false)
  // const [isEndingDatePickerVisible, setIsEndingDatePickerVisible] = useState(() => false)

  const [dayScrollReportArray, setDayScrollReportArray] = useState(() => [])

  const [totalAmount, setTotalAmount] = useState(() => 0)

  const startDate = selectedStartDate
    ? selectedStartDate.toISOString().slice(0, 10)
    : ""
  const endDate = selectedEndDate
    ? selectedEndDate.toISOString().slice(0, 10)
    : ""

  // const showStartingDatePicker = () => {
  //   setIsStartingDatePickerVisible(true)
  // }

  // const showEndingDatePicker = () => {
  //   setIsEndingDatePickerVisible(true)
  // }

  // const hideStartingDatePicker = () => {
  //   setIsStartingDatePickerVisible(false)
  // }

  // const hideEndingDatePicker = () => {
  //   setIsEndingDatePickerVisible(false)
  // }

  // const handleConfirmPickedFromDate = date => {
  //   console.warn("PICKED DATE >>>>>>>>>>>", date)
  //   const modifiedFromDate = new Date(date).toISOString().slice(0, 10)
  //   setStartingDate(modifiedFromDate)
  //   hideStartingDatePicker()
  // }

  // const handleConfirmPickedToDate = date => {
  //   console.warn("PICKED DATE >>>>>>>>>>>", date)
  //   const modifiedToDate = new Date(date).toISOString().slice(0, 10)
  //   setEndingDate(modifiedToDate)
  //   hideEndingDatePicker()
  // }

  const onDateChange = (date, type) => {
    if (type === "END_DATE") {
      setSelectedEndDate(date)
      setShowModal(false)
    } else {
      setSelectedStartDate(date)
      setSelectedEndDate(null)
    }
  }

  const tableHead = ["Sl No.", "Date", "A/c Type", "A/c No.", "Name", "Amount"]
  let tableData = dayScrollReportArray

  const getReportsDayScroll = async () => {
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      from_date: startDate,
      to_date: endDate,
    }
    let totalDepositedAmount = 0
    await axios
      .post(address.DAY_SCROLL_REPORT, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
        res.data.success.msg.forEach((item, i) => {
          let rowArr = [
            i + 1,
            new Date(item.date).toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit", year: "2-digit"}),
            item.account_type == "D"
              ? "Daily"
              : item.account_type == "R"
              ? "RD"
              : item.account_type == "L"
              ? "Loan"
              : "",
            item.account_number,
            item.account_holder_name,
            item.deposit_amount,
          ]
          totalDepositedAmount += item.deposit_amount
          console.log("ITEMMM TABLEEE=====", rowArr)
          tableData.push(...[rowArr])
          // printReceipt(item.date, startDate, endDate, item.account_number, item.account_holder_name, item.deposit_amount)

        })
        
        setTotalAmount(totalDepositedAmount)
        console.log("++++++ TABLE DATA ++++++++", tableData)
        setDayScrollReportArray(tableData)
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



  async function printReceipt() {
    try {
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER,
      )
      await BluetoothEscposPrinter.printText(bankName, { align: "center" })
      await BluetoothEscposPrinter.printText("\r\n", {})
      await BluetoothEscposPrinter.printText(branchName, { align: "center" })
      await BluetoothEscposPrinter.printText("\r\n", {})
      await BluetoothEscposPrinter.printColumn(
        [10, 2, 18],
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["Date", ":", new Date().toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit", year: "2-digit"}).toString()],
        {},
      )
      await BluetoothEscposPrinter.printColumn(
        [10, 2, 18],
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["Agent", ":", agentName],
        {},
      )

      await BluetoothEscposPrinter.printText(
        "-------------------------------\n",
        {},
      )

      await BluetoothEscposPrinter.printText("DAY SCROLL REPORT\r\n", {
        align: "center",
      })

      await BluetoothEscposPrinter.printText(`FROM: ${new Date(startDate).toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit", year: "2-digit"})}  TO: ${new Date(endDate).toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit", year: "2-digit"})}`, {
        align: "center",
      })

      await BluetoothEscposPrinter.printText("\r", {})

      // await BluetoothEscposPrinter.printPic(logo, { width: 300, align: "center", left: 30 })

      await BluetoothEscposPrinter.printText(
        "-------------------------------",
        {},
      )
      await BluetoothEscposPrinter.printText("\r\n", {})

      let columnWidthsHeader = [10, 10, 10]
      await BluetoothEscposPrinter.printColumn(
        columnWidthsHeader,
        [
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.CENTER,
        ],
        ["Date", "A/c No", "Amt"],
        {},
      )

      const copiedTableData = [...tableData]
      console.log("TABLLLELEEEEE DDDAAATAAAA  CPPPYYY ", copiedTableData)

      let columnWidthsBody = [30]
      copiedTableData.forEach(async item => {
        let newItems = [...item]
        console.log("new itemsssssss", newItems)
        const updatedItems = removeIndexes(newItems, [0, 2, 4])

        // updatedItems[2] = updatedItems[2].slice(0, 8)
        let items = updatedItems.join("   ")
        console.log("++==++ PRINTED ITEM", items)
        await BluetoothEscposPrinter.printColumn(
          columnWidthsBody,
          [BluetoothEscposPrinter.ALIGN.CENTER],
          [items.toString()],
          {},
        )
      })

      await BluetoothEscposPrinter.printText(
        "-------------------------------\n",
        {},
      )

      await BluetoothEscposPrinter.printText(`TOTAL AMOUNT: ${totalAmount}\r\n`, {
        align: "center",
      })
      // await BluetoothEscposPrinter.printText("Total Receipts: " + totalReceipts + "\n", { align: "center" })
      // await BluetoothEscposPrinter.printText("Total Amount: " + total + "\n", { align: "center" })
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



  // useEffect(() => {
  //   tableData = []
  //   getReportsDayScroll()
  // }, [selectedEndDate])

  const handleSubmit = () => {
    tableData = []
    getReportsDayScroll()
  }

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
        <Text style={styles.todayCollection}>Day Scroll Report</Text>
        <View style={styles.dateWrapper}>
          {/* <TouchableOpacity onPress={() => showStartingDatePicker()} style={styles.dateButton}>
            <Text>{startingDate}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => showEndingDatePicker()} style={styles.dateButton}>
            <Text>{endingDate}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isStartingDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmPickedFromDate}
            onCancel={hideStartingDatePicker}
          />
          <DateTimePickerModal
            isVisible={isEndingDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmPickedToDate}
            onCancel={hideEndingDatePicker}
          /> */}

          {/* <TouchableOpacity onPress={() => setShowModal(true)} style={styles.dateButton}>
            <Text>Show Calendar</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{
              justifyContent: "space-around",
              flexDirection: "row",
              backgroundColor: "forestgreen",
              padding: 10,
              margin: 10,
              borderRadius: 10,
              height: 40,
              width: "100%",
            }}>
            {/* <Text>Show Calendar</Text> */}
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: COLORS.lightScheme.onPrimary,
                fontWeight: "bold",
              }}>
              From: {new Date(startDate).toLocaleDateString("en-GB")}
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: COLORS.lightScheme.onPrimary,
                fontWeight: "bold",
              }}>
              To: {new Date(endDate).toLocaleDateString("en-GB")}
            </Text>
          </TouchableOpacity>
          <Modal visible={showModal} animationType="fade">
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.lightScheme.onPrimary,
                margin: 20,
              }}>
              <CalendarPicker
                startFromMonday={true}
                allowRangeSelection={true}
                todayBackgroundColor="tomato"
                selectedDayColor="dodgerblue"
                selectedDayTextColor="#FFFFFF"
                onDateChange={onDateChange}
              />
            </View>
          </Modal>
        </View>
        {/* <View style={{justifyContent: "space-around", flexDirection: "row", backgroundColor: "coral", padding: 10, margin: 10, borderRadius: 10}}>
            <Text style={{ fontSize: 15, fontWeight: 500, color: COLORS.lightScheme.onPrimary, fontWeight: "bold" }}>From: {startDate}</Text>
            <Text style={{ fontSize: 15, fontWeight: 500, color: COLORS.lightScheme.onPrimary, fontWeight: "bold" }}>To: {endDate}</Text>
          </View> */}
        <View>
          <TouchableOpacity
            onPress={() => handleSubmit()}
            style={styles.dateButton}>
            <Text>SUBMIT</Text>
          </TouchableOpacity>
        </View>
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
              <Rows data={tableData} textStyle={styles.text} />
            </Table>
          )}
        </ScrollView>
        <Text>Total Amount: {totalAmount}</Text>
        <TouchableOpacity
            onPress={() => printReceipt()}
            style={styles.dateButton}>
            <Text>PRINT</Text>
          </TouchableOpacity>
      </View>
    </View>
  )
}

export default ReportDay

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
