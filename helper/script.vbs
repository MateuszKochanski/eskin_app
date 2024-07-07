Sub CreatePointCharts()
    Dim wsConfig As Worksheet
    Dim wsNew As Worksheet
    Dim chartObject As ChartObject
    Dim configRow As Long
    Dim sheetName As String
    Dim xColumnName As String
    Dim yColumnName As String
    Dim dataWs As Worksheet
    Dim xRange As Range
    Dim yRange As Range
    Dim chartTitle As String
    Dim chartLeft As Long
    Dim chartTop As Long
    Dim xLabel As String
    Dim yLabel As String
    Dim xColIndex As Long
    Dim yColIndex As Long
    Dim chartCounter As Long
    
    ' Set the configuration worksheet
    Set wsConfig = ThisWorkbook.Sheets("Config")
    
    ' Create a new worksheet for the charts
    Set wsNew = ThisWorkbook.Sheets.Add
    wsNew.Name = "Charts"
    
    ' Start reading the configuration from row 2 (assuming row 1 has headers)
    configRow = 2
    chartLeft = 10 ' Initial left position for the first chart
    chartTop = 10 ' Initial top position for the first chart
    chartCounter = 0 ' Counter for charts in the current row
    
    ' Loop through each configuration entry until an empty cell is found in the Sheetname column
    Do While wsConfig.Cells(configRow, 1).Value <> ""
        ' Read the configuration data
        sheetName = wsConfig.Cells(configRow, 1).Value
        xColumnName = wsConfig.Cells(configRow, 2).Value
        yColumnName = wsConfig.Cells(configRow, 3).Value
        
        ' Get the worksheet with the data
        On Error Resume Next
        Set dataWs = ThisWorkbook.Sheets(sheetName)
        On Error GoTo 0
        
        If Not dataWs Is Nothing Then
            ' Find the column indexes based on the first row values
            xColIndex = 0
            yColIndex = 0
            For i = 1 To dataWs.Cells(1, dataWs.Columns.Count).End(xlToLeft).Column
                If dataWs.Cells(1, i).Value = xColumnName Then
                    xColIndex = i
                End If
                If dataWs.Cells(1, i).Value = yColumnName Then
                    yColIndex = i
                End If
                If xColIndex > 0 And yColIndex > 0 Then Exit For
            Next i
            
            ' Check if both columns were found
            If xColIndex > 0 And yColIndex > 0 Then
                ' Define the ranges for X and Y data
                Set xRange = dataWs.Range(dataWs.Cells(2, xColIndex), dataWs.Cells(dataWs.Cells(dataWs.Rows.Count, xColIndex).End(xlUp).Row, xColIndex))
                Set yRange = dataWs.Range(dataWs.Cells(2, yColIndex), dataWs.Cells(dataWs.Cells(dataWs.Rows.Count, yColIndex).End(xlUp).Row, yColIndex))
                
                ' Get the labels from the first row
                xLabel = xColumnName
                yLabel = yColumnName
                
                ' Create the chart
                Set chartObject = wsNew.ChartObjects.Add(Left:=chartLeft, Width:=375, Top:=chartTop, Height:=225)
                With chartObject.Chart
                    .ChartType = xlXYScatter
                    .SetSourceData Source:=Union(xRange, yRange)
                    .SeriesCollection(1).XValues = xRange
                    .SeriesCollection(1).Values = yRange
                    .HasTitle = True
                    .ChartTitle.Text = sheetName ' Set the chart title to the sheet name
                    .Axes(xlCategory).HasTitle = True
                    .Axes(xlCategory).AxisTitle.Text = xLabel
                    .Axes(xlValue).HasTitle = True
                    .Axes(xlValue).AxisTitle.Text = yLabel
                    
                    ' Remove gridlines
                    .Axes(xlCategory, xlPrimary).MajorGridlines.Delete
                    .Axes(xlValue, xlPrimary).MajorGridlines.Delete
                    
                    ' Remove legend
                    .HasLegend = False
                End With
                
                ' Update chart position for the next chart
                chartCounter = chartCounter + 1
                If chartCounter Mod 5 = 0 Then
                    chartLeft = 10 ' Reset left position for the next row
                    chartTop = chartTop + 250 ' Move down to the next row
                Else
                    chartLeft = chartLeft + 385 ' Move to the right for the next chart in the same row
                End If
            End If
        End If
        
        ' Move to the next configuration row
        configRow = configRow + 1
        Set dataWs = Nothing
    Loop
End Sub
