import { useContext, useState } from "react"
import {
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
} from "react-native"
import { AppStore } from "../../Context/AppContext"
import CustomHeader from "../../Components/CustomHeader"
import { COLORS } from "../../Resources/colors"
import { Table, Rows, Row } from "react-native-table-component"
import axios from "axios"
import { address } from "../../Routes/addresses"
import { useEffect } from "react"
import { ActivityIndicator } from "react-native"

const NonCollection = () => {
  const { userId, bankId, branchCode } = useContext(AppStore)

  const [nonCollectionReport, setNonCollectionReport] = useState(() => [])

  const [loading, setLoading] = useState(() => true)

  const tableHead = ["Sl No.", "A/c No.", "Name", "Phone"]
  let tableData = nonCollectionReport

  const getNonCollectionReport = async () => {
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
    }
    await axios
      .post(address.NON_COLLECTON_REPORT, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
        res.data.success.msg.forEach((item, i) => {
          let rowArr = [
            i + 1,
            item.account_number,
            item.customer_name,
            item.mobile_no,
          ]
          console.log("NONNNNN COLLLLL ITEMMM TABLEEE=====", rowArr)
          tableData.push(...[rowArr])
        })
        console.log("++++++ TABLE DATA ++++++++", tableData)
        setNonCollectionReport(tableData)
        setLoading(false)
      })
      .catch(err => {
        ToastAndroid.showWithGravityAndOffset(
          "Error occurred in the server",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
          25,
          50,
        )
        console.log(err.response.data)
      })
  }

  useEffect(() => {
    tableData = []
    getNonCollectionReport()
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
        <Text style={styles.todayCollection}>Non Collection Report</Text>
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

export default NonCollection

const styles = StyleSheet.create({
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
