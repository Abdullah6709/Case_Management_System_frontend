import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import AssessmentIcon from '@mui/icons-material/Assessment';

// PDF & Excel libraries
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const Reports = () => {
  const [reportType, setReportType] = useState('cases');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/firm/reports?type=${reportType}`);
      setData(response.data);
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  // Excel Export Handler
  const exportToExcel = () => {
    if (data.length === 0) return;

    // Format data slightly for cleaner excel output rows
    const cleanedData = data.map((row) => {
      if (reportType === 'cases') {
        return {
          'Case Number': row.caseNumber,
          'Case Title': row.caseTitle,
          'Case Type': row.caseType,
          'Filing Date': new Date(row.filingDate).toLocaleDateString(),
          'Client Name': row.client?.fullName,
          'Assigned Advocate': row.advocate?.fullName,
          'Priority': row.priority,
          'Status': row.status,
        };
      } else if (reportType === 'clients') {
        return {
          'Client Name': row.fullName,
          'Email': row.email,
          'Mobile': row.mobileNumber,
          'City': row.city,
          'State': row.state,
          'Cases Open': row._count?.cases || 0,
        };
      } else if (reportType === 'advocates') {
        return {
          'Advocate Name': row.fullName,
          'Enrollment Number': row.enrollmentNumber,
          'Mobile': row.mobile,
          'Practice Area': row.practiceArea?.name,
          'Experience (Yrs)': row.experience,
          'Caseload Count': row._count?.cases || 0,
        };
      } else if (reportType === 'hearings') {
        return {
          'Hearing Date': new Date(row.hearingDate).toLocaleDateString(),
          'Time': row.hearingTime,
          'Case Title': row.case?.caseTitle,
          'Purpose': row.purpose,
          'Status': row.status,
          'Result': row.result || 'Pending',
        };
      } else if (reportType === 'court-wise') {
        return {
          'Court Name': row.courtName,
          'Court Type': row.courtType,
          'Court Room/No': row.courtNumber,
          'Case Count': row.caseCount,
        };
      } else if (reportType === 'advocate-wise') {
        return {
          'Advocate Name': row.fullName,
          'Enrollment Number': row.enrollmentNumber,
          'Case Count': row.caseCount,
        };
      }
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType}-Report`);
    XLSX.writeFile(workbook, `LCMS_${reportType}_report_${Date.now()}.xlsx`);
  };

  // PDF Export Handler
  const exportToPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(18);
    doc.text(`LCMS - ${reportType.toUpperCase()} REPORT`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 25);

    let columns = [];
    let body = [];

    if (reportType === 'cases') {
      columns = ['Case Number', 'Title', 'Type', 'Client', 'Advocate', 'Priority', 'Status'];
      body = data.map((r) => [
        r.caseNumber,
        r.caseTitle,
        r.caseType,
        r.client?.fullName,
        r.advocate?.fullName,
        r.priority,
        r.status,
      ]);
    } else if (reportType === 'clients') {
      columns = ['Name', 'Email', 'Mobile', 'City', 'State', 'Cases Count'];
      body = data.map((r) => [
        r.fullName,
        r.email,
        r.mobileNumber,
        r.city,
        r.state,
        r._count?.cases || 0,
      ]);
    } else if (reportType === 'advocates') {
      columns = ['Name', 'Enrollment', 'Practice Area', 'Exp', 'Qualification', 'Caseload'];
      body = data.map((r) => [
        r.fullName,
        r.enrollmentNumber,
        r.practiceArea?.name,
        `${r.experience} Yrs`,
        r.qualification,
        r._count?.cases || 0,
      ]);
    } else if (reportType === 'hearings') {
      columns = ['Date', 'Time', 'Case File', 'Purpose', 'Status', 'Result'];
      body = data.map((r) => [
        new Date(r.hearingDate).toLocaleDateString(),
        r.hearingTime,
        r.case?.caseTitle,
        r.purpose,
        r.status,
        r.result || 'Pending',
      ]);
    } else if (reportType === 'court-wise') {
      columns = ['Court Name', 'Type', 'Room/Number', 'Cases Assigned'];
      body = data.map((r) => [r.courtName, r.courtType, r.courtNumber, r.caseCount]);
    } else if (reportType === 'advocate-wise') {
      columns = ['Advocate Name', 'Enrollment Number', 'Cases Assigned'];
      body = data.map((r) => [r.fullName, r.enrollmentNumber, r.caseCount]);
    }

    doc.autoTable({
      head: [columns],
      body: body,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [3, 105, 161] }, // Navy primary fill
    });

    doc.save(`LCMS_${reportType}_report_${Date.now()}.pdf`);
  };

  // UI Table Columns
  const getTableColumns = () => {
    switch (reportType) {
      case 'cases':
        return [
          { id: 'caseNumber', label: 'Case Number' },
          { id: 'caseTitle', label: 'Title' },
          { id: 'caseType', label: 'Type' },
          { id: 'client', label: 'Client', render: (row) => row.client?.fullName },
          { id: 'advocate', label: 'Advocate', render: (row) => row.advocate?.fullName },
          { id: 'status', label: 'Status' },
        ];
      case 'clients':
        return [
          { id: 'fullName', label: 'Name' },
          { id: 'email', label: 'Email' },
          { id: 'mobileNumber', label: 'Mobile' },
          { id: 'city', label: 'City' },
          { id: 'cases', label: 'Cases Registered', render: (row) => row._count?.cases || 0 },
        ];
      case 'advocates':
        return [
          { id: 'fullName', label: 'Name' },
          { id: 'enrollmentNumber', label: 'Enrollment' },
          { id: 'practiceArea', label: 'Area', render: (row) => row.practiceArea?.name },
          { id: 'experience', label: 'Exp (Yrs)' },
          { id: 'caseload', label: 'Active Caseload', render: (row) => row._count?.cases || 0 },
        ];
      case 'hearings':
        return [
          { id: 'hearingDate', label: 'Date', render: (row) => new Date(row.hearingDate).toLocaleDateString() },
          { id: 'hearingTime', label: 'Time' },
          { id: 'case', label: 'Case File', render: (row) => row.case?.caseTitle },
          { id: 'purpose', label: 'Purpose' },
          { id: 'result', label: 'Result', render: (row) => row.result || 'Pending' },
        ];
      case 'court-wise':
        return [
          { id: 'courtName', label: 'Court Name' },
          { id: 'courtType', label: 'Type' },
          { id: 'courtNumber', label: 'Room/No' },
          { id: 'caseCount', label: 'Total Cases assigned' },
        ];
      case 'advocate-wise':
        return [
          { id: 'fullName', label: 'Advocate Name' },
          { id: 'enrollmentNumber', label: 'Enrollment' },
          { id: 'caseCount', label: 'Total Cases assigned' },
        ];
      default:
        return [];
    }
  };

  return (
    <Box sx={{ py: 0.5 }}>
      <Card sx={{ mb: 1.5, borderRadius: 1.5 }}>
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' } }}
              >
                <MenuItem value="cases">Cases Registry Report</MenuItem>
                <MenuItem value="clients">Clients Directory Report</MenuItem>
                <MenuItem value="advocates">Advocates Performance Report</MenuItem>
                <MenuItem value="hearings">Hearings Schedule Report</MenuItem>
                <MenuItem value="court-wise">Court-wise Case Distribution</MenuItem>
                <MenuItem value="advocate-wise">Advocate-wise Case Load</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true, style: { fontSize: '0.8rem' } }}
                sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true, style: { fontSize: '0.8rem' } }}
                sx={{ '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' } }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingScreen />
      ) : (
        <DataTable
          title="Reports Generator"
          headerAction={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<PictureAsPdfIcon />}
                onClick={exportToPDF}
                disabled={data.length === 0}
                sx={{ height: 34, whiteSpace: 'nowrap' }}
              >
                PDF
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<TableViewIcon />}
                onClick={exportToExcel}
                disabled={data.length === 0}
                sx={{ height: 34, whiteSpace: 'nowrap' }}
              >
                Excel
              </Button>
            </Box>
          }
          columns={getTableColumns()}
          rows={data}
          searchPlaceholder="Filter report records..."
          searchField={reportType === 'cases' ? 'caseTitle' : (reportType === 'clients' ? 'fullName' : 'fullName')}
        />
      )}
    </Box>
  );
};

export default Reports;
