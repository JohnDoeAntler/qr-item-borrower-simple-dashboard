import { DataStore } from '@aws-amplify/datastore';
import List from '@mui/material/List'
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import './App.css';
import { BorrowRecord, Item } from './models';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, ListItemAvatar, ListItemButton, Switch, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/system/Box';
import QRCode from "react-qr-code";
import Snackbar from '@mui/material/Snackbar';
import { Predicates } from 'aws-amplify';
import { parse } from 'json2csv';
import flat from 'flat';

const StyledTextField = styled(TextField)`
  .MuiInputBase-root {
    background-color: rgba(256, 256, 256, 10%);
		color: white;
  }
`

const ItemListItem = (props: {
  item: Item;
  onClick: () => void;
}) => {
  return (
    <ListItem alignItems="flex-start">
      <ListItemButton onClick={() => props.onClick()}>
        <ListItemText
          primary={props.item.name}
          secondary={
            <>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                {props.item.description}
              </Typography>
              {" — is borrowed: " + !!props.item.record.some(e => e && !e.returnedAt)}
            </>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}

const EditableField = (props: {
  title: string;
  state: string;
  setState: (e: React.SetStateAction<string>) => void;
  isStyled?: boolean,
}) => {
  return (
    <>
      <Typography variant="h4" fontWeight={700} style={{ marginBottom: '.5rem' }}>
        {props.title}
      </Typography>

      {
        props.isStyled === true || props.isStyled === undefined ?
        <StyledTextField
          variant='filled'
          label={props.title}
          onChange={(e) => props.setState(e.currentTarget.value)}
          value={props.state}
          fullWidth
        /> :
        <TextField
          variant='filled'
          label={props.title}
          onChange={(e) => props.setState(e.currentTarget.value)}
          value={props.state}
          fullWidth
        />
      }

      <Typography variant="caption" fontWeight={200} style={{ marginTop: '.25rem' }}>
        Consectetur adipisicing quis magna ullamco duis laborum occaecat elit.
      </Typography>
    </>
  );
}

const App = () => {

  const [selectedItem, setSelectedItem] = useState<Item | undefined>();
  const [items, setItems] = useState<Item[]>([]);
  const [snackbar, setSnackBar] = useState('');
  const [openHistory, setOpenHistory] = React.useState(false);
  const [openFollowup, setOpenFollowup] = React.useState(false);

  useEffect(() => {

    DataStore.observeQuery(Item).subscribe((items) => {
      setItems(items.items);
    });
  }, []);

  const [inputName, setInputName] = useState('');
  const [inputDescription, setInputDescription] = useState<string | null | undefined>('');

  useEffect(() => {
    if (selectedItem) {
      setInputName(selectedItem.name);
      setInputDescription(selectedItem.description);
    }
  }, [selectedItem]);

  const createItem = async () => {
    if (!inputName.trim()) {
      setSnackBar('invalid operation: item name could not be empty.');
      return;
    }

    const item = await DataStore.save(
      new Item({
        name: inputName,
        description: inputDescription,
        record: [],
      })
    );

    setSelectedItem(item);
  }

  const updateItem = async () => {
    if (!selectedItem) {
      setSnackBar('invalid operation: no item selected.');
      return;
    }

    if (!inputName.trim()) {
      setSnackBar('invalid operation: item name could not be empty.');
      return;
    }

    const item = await DataStore.save(
      Item.copyOf(selectedItem, (item) => {
        item.name = inputName;
        item.description = inputDescription;
        return item;
      })
    );

    setSelectedItem(item);
  }

  const deleteItem = async () => {
    if (!selectedItem) {
      setSnackBar('invalid operation: no item selected.');
      return;
    }
    
    if (selectedItem.record) {
      setSnackBar('invalid operation: to-be deleted item could not be borrowed.');
      return;
    }

    const item = await DataStore.delete(Item, selectedItem.id);

    setSelectedItem(undefined);
  }

  const reset = async () => {
    if (!selectedItem) {
      return;
    }

    setInputName(selectedItem.name);
    setInputDescription(selectedItem.description);
  }

  const handleOpenHistory = () => {
    setOpenHistory(true);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
  };

  const handleOpenFollowup = () => {
    setOpenFollowup(true);
  };

  const handleCloseFollowup = (val: boolean) => {
    if (val) {
      setSnackBar('successfully updated the followup.');
    }

    setOpenFollowup(false);
  };

  const download = (content: string, fileName: string, mimeType: string): void => {
    const a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';

    if ((navigator as any).msSaveBlob) { // IE10
      (navigator as any).msSaveBlob(new Blob([content], {
        type: mimeType
      }), fileName);
    } else if (URL && 'download' in a) { //html5 A[download]
      a.href = URL.createObjectURL(new Blob([content], {
        type: mimeType
      }));
      a.setAttribute('download', fileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
    }
  }

  return (
    <div className="App" style={{
      minHeight: '100vh',
    }}>
      <Snackbar
        open={!!snackbar}
        autoHideDuration={20000}
        onClose={() => setSnackBar('')}
        message={snackbar}
      />
      <div style={{
        maxWidth: '1080px',
        minHeight: '100vh',
        width: '100%',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: '2rem',
      }}>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'rgba(256, 256, 256, 40%)', borderRadius: '.5rem', maxHeight: '80vh', overflow: 'auto', }}>
          {
            items.map(e => (
              <ItemListItem item={e} onClick={() => setSelectedItem(e)} />
            )).reduce((a, b) => (a.length && [...a, (
              <Divider variant="inset" />
            ), b] || [b]) as any, []) as any
          }
        </List>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'start',
          color: 'white'
        }}>
          <Typography variant="h2" fontWeight={900}>
            Item panel
          </Typography>

          <hr style={{ width: '100%', borderTop: 0, borderColor: 'rgba(256, 256, 256, 25%)' }} />

          <Typography variant="caption" fontWeight={200}>
            Adipisicing tempor nostrud in in. Et sit non culpa adipisicing aliquip enim. Tempor aliquip ut aute aute cillum ut velit aliqua voluptate. Excepteur commodo laborum aute nostrud aute ipsum. Deserunt exercitation minim incididunt officia labore consequat eiusmod ea Lorem deserunt tempor nisi dolor. Elit ipsum commodo elit esse irure sint veniam consectetur ea magna do sit. Voluptate nulla ea anim commodo reprehenderit mollit enim eu occaecat esse consequat incididunt dolor.
          </Typography>

          <hr style={{ width: '100%', borderTop: 0, borderColor: 'rgba(256, 256, 256, 25%)' }} />

          <hr />

          <Box sx={{marginBottom: '1rem'}}/>

          <EditableField 
            title="Item name"
            state={inputName}
            setState={setInputName}
          />

          <Box sx={{marginBottom: '1rem'}}/>

          <EditableField 
            title="Item description"
            state={inputDescription || ''}
            setState={setInputDescription as (e: React.SetStateAction<string>) => void}
          />

          <Box sx={{marginBottom: '1rem'}}/>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <div style={{
              flex: 1,
            }}>
              <Typography variant="h4" fontWeight={700} style={{ marginBottom: '.5rem' }}>
                Created At
              </Typography>

              <Typography variant="caption" fontWeight={200}>
                {selectedItem?.createdAt || 'N/A'}
              </Typography>
            </div>

            <div style={{
              flex: 1,
            }}>
              <Typography variant="h4" fontWeight={700} style={{ marginBottom: '.5rem' }}>
                Updated At
              </Typography>

              <Typography variant="caption" fontWeight={200}>
                {selectedItem?.updatedAt || 'N/A'}
              </Typography>
            </div>
          </div>

          {
            selectedItem?.id && 
              <>
                <Typography variant="h4" fontWeight={700} style={{ marginTop: '1rem', marginBottom: '.5rem' }}>
                  QR Code
                </Typography>

                <QRCode size={128} value={selectedItem?.id || ''} style={{ borderRadius: '.5rem', border: '.5rem white solid', }} />

                <Typography variant="caption" fontWeight={200} style={{ marginTop: '1rem' }}>
                  data: <span onClick={() => window.navigator.clipboard.writeText(selectedItem.id).then(() => setSnackBar('copied QR code data to clipboard.'))} style={{ cursor: 'pointer', backgroundColor: 'hsl(0, 50%, 50%)', border: '.2rem solid hsl(0, 50%, 50%)', borderRadius: '.2rem' }}>{selectedItem.id}</span>
                </Typography>
              </>
          }

          <Typography variant="caption" fontWeight={200} style={{ marginTop: '1rem' }}>
            Ut laboris Lorem quis enim ipsum nulla laborum irure ex amet. Eu elit occaecat anim ipsum cupidatat eiusmod aute eu Lorem. Dolor occaecat fugiat anim ut tempor id sint qui proident. Est aute anim ad dolore. Pariatur nostrud tempor sit amet anim labore laboris. Elit Lorem commodo deserunt exercitation aliqua dolore veniam ut velit enim.
          </Typography>

          <hr style={{ marginTop: '1.5rem' }} />

          <hr style={{ width: '100%', borderTop: 0, borderColor: 'rgba(256, 256, 256, 25%)', marginBottom: '1rem' }} />

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            columnGap: '1rem'
          }}>
            <Button 
              variant="contained"
              color='primary'
              onClick={() => createItem()}
            >
              Create
            </Button>

            <Button 
              variant="contained"
              color='secondary'
              onClick={() => updateItem()}
            >
              Update
            </Button>

            <Button 
              variant="contained"
              color='error'
              onClick={() => deleteItem()}
            >
              Delete
            </Button>

            <Button 
              variant="contained"
              color='warning'
              onClick={() => reset()}
            >
              Reset
            </Button>

            <Button 
              variant="contained"
              color='info'
              onClick={() => {
                if (selectedItem) {
                  download(parse(flat(selectedItem) as any), 'report.csv', 'text/csv;encoding:utf-8');
                }
              }}
            >
              REPORT
            </Button>

            {
              selectedItem?.record.filter(e => e).length ?
              <>
                <Button 
                  variant="contained"
                  color='info'
                  onClick={handleOpenHistory}
                >
                  history
                </Button>
              
                <SimpleHistoryDialog 
                  open={openHistory}
                  onClose={handleCloseHistory}
                  record={selectedItem.record as BorrowRecord[]}
                />
              </>
              : <></>
            }

            {
              selectedItem ?
              <>
                <Button 
                  variant="contained"
                  color='info'
                  onClick={handleOpenFollowup}
                >
                  Followup
                </Button>
              </> : <></>
            }
          </div>
        </div>
      </div>

      {
        selectedItem ?
        <FollowupDialog 
          open={openFollowup}
          onClose={handleCloseFollowup}
          item={selectedItem}
        /> :
        <></>
      }
    </div>
  );
}

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
}

const SimpleHistoryDialog = (props: SimpleDialogProps & {
  record: BorrowRecord[];
}) => {

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Borrowing History of current item</DialogTitle>
      <List sx={{ pt: 0 }}>
        {props.record.filter(e => e).map((r) => (
          <ListItem key={r.userId + r.borrowedAt}>
            <ListItemText primary={`user ${r.username} (${r.userId}) borrowed this item at ${r.borrowedAt}${r.returnedAt ? ` returned this item at ${r.returnedAt}` : '.'}`} />
          </ListItem>
        )).reduce((a, b) => (a.length && [...a, (
            <Divider variant="inset" />
          ), b] || [b]) as any, [])}
      </List>
    </Dialog>
  );
}

export interface FollowupDialogProps {
  open: boolean;
  item: Item;
  onClose: (status: boolean) => void;
}

const FollowupDialog = (props: FollowupDialogProps) => {

  const [assetNo, setAssetNo] = useState<string>('');
  const [tagNumber, setTagNumber] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [modelNur, setModelNur] = useState<string>('');
  const [taggable, setTaggable] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [assetAdm, setAssetAdm] = useState<string>('');
  const [maintBh, setMaintBh] = useState<string>('');
  const [datePlaceInService, setDatePlaceInService] = useState<string>('');
  const [assetCost, setAssetCost] = useState<number>(0);
  const [department, setDepartment] = useState<string>('');
  const [campus, setCampus] = useState<string>('');
  const [block, setBlock] = useState<string>('');
  const [floor, setFloor] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [PONo, setPONo] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [projectCode, setProjectCode] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  useEffect(() => {
    if (props.item) {
      setAssetNo(props.item.followup?.assetNo || '');
      setTagNumber(props.item.followup?.tagNumber || '');
      setSerialNumber(props.item.followup?.serialNumber || '');
      setModelNur(props.item.followup?.modelNur || '');
      setTaggable(props.item.followup?.taggable || false);
      setCategory(props.item.followup?.category || '');
      setSubCategory(props.item.followup?.subCategory || '');
      setAssetAdm(props.item.followup?.assetAdm || '');
      setMaintBh(props.item.followup?.maintBh || '');
      setDatePlaceInService(props.item.followup?.datePlaceInService || '');
      setAssetCost(props.item.followup?.assetCost || 0);
      setDepartment(props.item.followup?.department || '');
      setCampus(props.item.followup?.campus || '');
      setBlock(props.item.followup?.block || '');
      setFloor(props.item.followup?.floor || '');
      setRoom(props.item.followup?.room || '');
      setPONo(props.item.followup?.PONo || '');
      setInvoiceNo(props.item.followup?.invoiceNo || '');
      setProjectCode(props.item.followup?.projectCode || '');
      setRemarks(props.item.followup?.remarks || '');
    }
  }, [props.item]);
  const onSubmit = async () => {
    const item = await DataStore.save(
      Item.copyOf(props.item, (item) => {
        if (!item.followup) {
          item.followup = {};
        }
        if (assetNo) item.followup.assetNo = assetNo;
        if (tagNumber) item.followup.tagNumber = tagNumber;
        if (serialNumber) item.followup.serialNumber = serialNumber;
        if (modelNur) item.followup.modelNur = modelNur;
        if (taggable) item.followup.taggable = taggable;
        if (category) item.followup.category = category;
        if (subCategory) item.followup.subCategory = subCategory;
        if (assetAdm) item.followup.assetAdm = assetAdm;
        if (maintBh) item.followup.maintBh = maintBh;
        if (datePlaceInService) item.followup.datePlaceInService = datePlaceInService;
        if (assetCost) item.followup.assetCost = assetCost;
        if (department) item.followup.department = department;
        if (campus) item.followup.campus = campus;
        if (block) item.followup.block = block;
        if (floor) item.followup.floor = floor;
        if (room) item.followup.room = room;
        if (PONo) item.followup.PONo = PONo;
        if (invoiceNo) item.followup.invoiceNo = invoiceNo;
        if (projectCode) item.followup.projectCode = projectCode;
        if (remarks) item.followup.remarks = remarks;

        return item;
      })
    );

    props.onClose(true);
  }

  return (
    <Dialog open={props.open} onClose={() => props.onClose(false)}>
      <DialogTitle>Borrowing History of current item</DialogTitle>
      <DialogContent>
        <List sx={{ pt: 0 }} style={{ color: "black !important" }}>
          <EditableField 
            title="Asset No"
            state={assetNo || ''}
            setState={setAssetNo}
            isStyled={false}
          />
          <EditableField
            title="tagNumber"
            state={tagNumber}
            setState={setTagNumber}
            isStyled={false}
          />
          <EditableField
            title="serialNumber"
            state={serialNumber}
            setState={setSerialNumber}
            isStyled={false}
          />
          <EditableField
            title="modelNur"
            state={modelNur}
            setState={setModelNur}
            isStyled={false}
          />

          <Typography variant="h4" fontWeight={700} style={{ marginBottom: '.5rem' }}>
            Taggable
          </Typography>

          <FormGroup>
            <FormControlLabel control={<Switch defaultChecked checked={taggable} onChange={(e) => setTaggable(e.target.checked)} />} label="Label" />
          </FormGroup>

          <Typography variant="caption" fontWeight={200} style={{ marginTop: '.25rem' }}>
            Consectetur adipisicing quis magna ullamco duis laborum occaecat elit.
          </Typography>

          <EditableField
            title="category"
            state={category}
            setState={setCategory}
            isStyled={false}
          />
          <EditableField
            title="subCategory"
            state={subCategory}
            setState={setSubCategory}
            isStyled={false}
          />
          <EditableField
            title="assetAdm"
            state={assetAdm}
            setState={setAssetAdm}
            isStyled={false}
          />
          <EditableField
            title="maintBh"
            state={maintBh}
            setState={setMaintBh}
            isStyled={false}
          />
          <EditableField
            title="datePlaceInService"
            state={datePlaceInService}
            setState={setDatePlaceInService}
            isStyled={false}
          />

          <Typography variant="h4" fontWeight={700} style={{ marginBottom: '.5rem' }}>
            Assets Cost
          </Typography>

          <TextField
            type="number"
            inputProps={{ inputMode: 'numeric' }}
            variant='filled'
            label="Asset Cost"
            onChange={(e) => setAssetCost(parseFloat(e.currentTarget.value))}
            value={assetCost}
            fullWidth
          />

          <FormGroup>
            <FormControlLabel control={<Switch defaultChecked />} label="Label" />
          </FormGroup>

          <Typography variant="caption" fontWeight={200} style={{ marginTop: '.25rem' }}>
            Consectetur adipisicing quis magna ullamco duis laborum occaecat elit.
          </Typography>

          <EditableField
            title="department"
            state={department}
            setState={setDepartment}
            isStyled={false}
          />
          <EditableField
            title="campus"
            state={campus}
            setState={setCampus}
            isStyled={false}
          />
          <EditableField
            title="block"
            state={block}
            setState={setBlock}
            isStyled={false}
          />
          <EditableField
            title="floor"
            state={floor}
            setState={setFloor}
            isStyled={false}
          />
          <EditableField
            title="room"
            state={room}
            setState={setRoom}
            isStyled={false}
          />
          <EditableField
            title="PONo"
            state={PONo}
            setState={setPONo}
            isStyled={false}
          />
          <EditableField
            title="invoiceNo"
            state={invoiceNo}
            setState={setInvoiceNo}
            isStyled={false}
          />
          <EditableField
            title="projectCode"
            state={projectCode}
            setState={setProjectCode}
            isStyled={false}
          />
          <EditableField
            title="remarks"
            state={remarks}
            setState={setRemarks}
            isStyled={false}
          />
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onClose(false)}>cancel</Button>
        <Button onClick={onSubmit} autoFocus>
          Update followup
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default App;
