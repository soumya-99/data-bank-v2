import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  PixelRatio,
  TouchableOpacity,
} from "react-native"
import React, { useContext, useEffect, useState } from "react"
import axios from "axios"
import { address } from "../../Routes/addresses"
import { Row, Rows, Table } from "react-native-table-component"
import CustomHeader from "../../Components/CustomHeader"
import { COLORS } from "../../Resources/colors"
import { AppStore } from "../../Context/AppContext"

export default function LastFiveTnxReport() {
  const { userId, bankId, branchCode } = useContext(AppStore)
  const [lastFiveData, setLastFiveData] = useState(() => [])

  const tableHead = ["Date", "Acc No", "Name", "Dep Amt"]
  let tableData = lastFiveData

  const getLastFiveTnx = async () => {
    await axios
      .post(
        address.LAST_FIVE_TRANSACTIONS,
        {
          bank_id: bankId,
          branch_code: branchCode,
          agent_code: userId,
        },
        {
          headers: {
            Accept: "application/json",
          },
        },
      )
      .then(res => {
        // setLastFiveData(res.data.data.msg)
        res.data.data.msg.forEach((item, i) => {
          let row = [
            new Date(item.transaction_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }),
            item.account_number,
            item.account_holder_name,
            item.deposit_amount,
          ]
          console.log("dfasjhgfisgyaf", row)

          tableData.push(...[row])
        })

        setLastFiveData(tableData)
      })
  }

  const handleSubmit = () => {
    tableData = []
    getLastFiveTnx()
  }

  //   useEffect(() => {
  //     tableData = []
  //     getLastFiveTnx()
  //   }, [])

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
        <Text style={styles.todayCollection}>Last Five Transactions</Text>
        <View>
          <TouchableOpacity
            onPress={() => handleSubmit()}
            style={styles.dateButton}>
            <Text>GET REPORT</Text>
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
        {/* <View>
          <TouchableOpacity
            onPress={() => printReceipt()}
            style={styles.dateButton}>
            <Text>Print</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  )
}

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
  footerText: {
    fontSize: 15,
    fontWeight: "600",
  },
})
