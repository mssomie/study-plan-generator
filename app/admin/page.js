"use client";
import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { 
  DataGrid, 
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import { Refresh, AdminPanelSettings } from '@mui/icons-material';

const AdminDashboard = () => {
  const [data, setData] = useState({
    prompts: [],
    performance: [],
    pddls: [],
    sessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTable, setCurrentTable] = useState('prompts');
  const [isAdmin, setIsAdmin] = useState(false);

  const columns = {
    prompts: [
      { field: 'id', headerName: 'ID', width: 200 },
      { 
        field: 'timestamp', 
        headerName: 'Date', 
        width: 180, 
        type: 'dateTime',
        valueGetter: (params) => {
          const timestamp = params.row?.timestamp;
          if (!timestamp) return null;
          return timestamp?.toDate?.() || new Date(timestamp);
        }
      },
      { field: 'prompt', headerName: 'Prompt ID', width: 220 },
      { field: 'user_id', headerName: 'User ID', width: 220 },
      { field: 'promptEngineeringResponse', headerName: 'Prompt Engineering', width: 120 }, 
      { field: 'pddlPlannerResponse', headerName: 'PDDL-Planner', width: 120 },
      { field: 'zeroShotResponse', headerName: 'Zero Shot', width: 120 },
    ],
    performance: [
      { field: 'id', headerName: 'ID', width: 200 },
      { 
        field: 'timestamp', 
        headerName: 'Date', 
        width: 180, 
        type: 'dateTime',
        valueGetter: (params) => {
          const timestamp = params.row?.timestamp;
          if (!timestamp) return null;
          return timestamp?.toDate?.() || new Date(timestamp);
        }
      },
      { field: 'workflowType', headerName: 'Workflow', width: 120 },
      { field: 'timeTaken', headerName: 'Duration (ms)', width: 120, type: 'number' },
      { field: 'success', headerName: 'Status', width: 120, 
        renderCell: (params) => (
          <Chip 
            label={params.value ? 'Success' : 'Failed'} 
            color={params.value ? 'success' : 'error'} 
            size="small" 
          />
        )
      }
    ],
    pddls: [
      { field: 'id', headerName: 'ID', width: 200 },
      { 
        field: 'timestamp', 
        headerName: 'Date', 
        width: 180, 
        type: 'dateTime',
        valueGetter: (params) => {
          const timestamp = params.row?.timestamp;
          if (!timestamp) return null;
          return timestamp?.toDate?.() || new Date(timestamp);
        }
      },
      { field: 'domainPddl', headerName: 'Domain PDDL', width: 300 },
      { field: 'problemPddl', headerName: 'Problem PDDL', width: 300 }
    ],
    sessions: [
      { field: 'id', headerName: 'User ID', width: 220 },
      { 
        field: 'createdAt', 
        headerName: 'Created', 
        width: 180, 
        type: 'dateTime',
        valueGetter: (params) => {
            const createdAt = params.row?.createdAt;    
            if (!createdAt) return null;   
            return createdAt?.toDate?.() || new Date(createdAt);
        }
      },
      { 
        field: 'lastLogin', 
        headerName: 'Last Active', 
        width: 180, 
        type: 'dateTime',
        valueGetter: (params) => {
            const lastLogin = params.row?.lastLogin;
            if (!lastLogin) return null;
            return lastLogin?.toDate?.() || new Date(lastLogin);
        }
          
      },
      { field: 'submitted', headerName: 'Completed', width: 120, type: 'boolean' }
    ]
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const collections = ['prompts', 'performance', 'pddls', 'sessions'];
      const newData = {};
      
      for (const col of collections) {
        const q = query(collection(db, col));
        const querySnapshot = await getDocs(q);
        newData[col] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
      setData(newData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add your admin verification logic here
    const verifyAdmin = async () => {
      // Example: Check user role from Firebase Auth
      setIsAdmin(true); // Set to your actual admin check
      if (isAdmin) fetchData();
    };
    verifyAdmin();
  }, []);

  if (!isAdmin) return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'background.default'
    }}>
      <Typography variant="h4" color="error">
        <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
        Admin Access Required
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ 
      p: 4, 
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Study Planner Admin Dashboard
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        {Object.keys(columns).map((table) => (
          <Chip
            key={table}
            label={table.toUpperCase()}
            onClick={() => setCurrentTable(table)}
            color={currentTable === table ? 'primary' : 'default'}
            sx={{ 
              textTransform: 'uppercase',
              fontSize: '0.9rem',
              px: 2,
              py: 1
            }}
          />
        ))}
        <IconButton onClick={fetchData} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      <Paper sx={{ 
        height: 600, 
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: 3
      }}>
        <DataGrid
          rows={data[currentTable]}
          columns={columns[currentTable]}
          loading={loading}
          components={{
            Toolbar: () => (
              <GridToolbarContainer sx={{ p: 2 }}>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
              </GridToolbarContainer>
            ),
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'background.default',
              fontSize: '1rem'
            },
          }}
          density="comfortable"
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;