'use client'
import Image from "next/image";
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import {Box, Button, Modal, Paper, Stack, TextField, Typography} from '@mui/material'
import { collection, deleteDoc, doc, setDoc, getDoc, getDocs, query } from "firebase/firestore";
import styled from "@emotion/styled";

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [val, setVal] = useState('')
  const [currentItem, setCurrentItem] = useState(null);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({name: doc.id, ...doc.data()})
    })
    setInventory(inventoryList)
  }

  const getItem = async(item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      console.log(item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        setSearchResult({name: item, quantity: quantity})
      } else {
        setSearchResult({name: `${item} - Not in Inventory`, quantity: 0})
      }
    } catch (error){
      console.error("Error fetching item: ", error);
      setSearchResult(null);
    }
    
  }

  const addItem = async(item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const editItem = async(item, num) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      if (num > 0) {
        await setDoc(docRef, { quantity: num })
      } else {
        await deleteDoc(docRef)
      }
    } 
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleSearchOpen = () => setSearchOpen(true)
  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchResult(null); // Reset search result when closing the modal
  }
  const handleOpenEdit = (item) => {
    setCurrentItem(item); // Set the current item to be edited
    setEditOpen(true);
  };
  const handleCloseEdit = () => {
    setEditOpen(false);
    setCurrentItem(null); // Clear the current item when closing
  };

  return (
    <Box
      sx={{ m: 1 }}
      bgcolor='#eaf3ea'
      width="100vw" // takes the width of the whole screen
      height="100vh" // takes the height of the whole screen
      display={'flex'}
      justifyContent={'center'} // centers horizontally
      flexDirection={'column'}
      alignItems={'center'} // centers vertically
      gap={2}>
        <Typography marginTop='5' marginBottom='3' variant={'h1'} color={'#263226'} textAlign={'center'}>
            Welcome to Inventory Management!
        </Typography>
        <Modal
          open={searchOpen}
          onClose={handleSearchClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description">
          <Box sx={{ p: 2, bgcolor: '#eaf3ea', width: 400, margin: 'auto', mt: '15%' }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Search Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                sx={{ backgroundColor: '#263226', color: '#fff', '&:hover': { backgroundColor: '#596559' } }}
                variant="outlined"
                onClick={() => {
                  getItem(itemName.toLowerCase())
                  setItemName('')
                }}
              >
                Search
              </Button>
            </Stack>
            {searchResult && (
              <Box mt={2}>
                <Typography variant="h4" color="#333" textAlign="left">
                  {searchResult.name.charAt(0).toUpperCase() + searchResult.name.slice(1)}
                </Typography>
                <Typography variant="h5" color="#333" textAlign="left">
                  Quantity: {searchResult.quantity}
                </Typography>
              </Box>
            )}
          </Box>
        </Modal>

        <Button variant="contained" 
          sx={{ backgroundColor: '#263226', color: '#fff', '&:hover': { backgroundColor: '#596559' } }} 
          onClick={handleSearchOpen}>
          Search Item
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description">
          <Box sx={{ p: 2, bgcolor: '#eaf3ea', width: 400, margin: 'auto', mt: '15%' }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                 sx={{ backgroundColor: '#263226', color: '#fff', '&:hover': { backgroundColor: '#596559' } }}
                variant="outlined"
                onClick={() => {
                  addItem(itemName.toLowerCase())
                  setItemName('')
                  handleClose()
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Button variant="contained" 
          sx={{ backgroundColor: '#263226', color: '#fff', '&:hover': { backgroundColor: '#596559' } }} 
          onClick={handleOpen}>
          Add New Item
        </Button>
        <Box 
          //border={'1px solid #333'} 
          overflow="auto" 
          height="500px">
          
          <Paper 
              elevation={5}>
          <Box
            width="1040px"
            height="100px"
            bgcolor={'#596559'}
            marginBottom={'4'}
            //bgcolor={'#fff'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Typography variant={'h2'} color={'#fff'} textAlign={'center'}>
              Inventory Items
            </Typography>
          </Box>
          </Paper>
          <Stack 
            width="1040px" 
            flexWrap="wrap" 
            direction="row"
            justifyContent="flex-start">
            {inventory.map(({name, quantity}) => (
            <Paper 
              key={name}
              elevation={5} 
              sx={{width:{xs:1, md:320}, 
              marginTop: 1, marginBottom: 1, marginLeft: 1.5, marginRight: 1.5}}>
              <Box
                width="100%"
                minHeight="150px"
                display={'flex'}
                alignItems={'center'}
                bgcolor={'#bdcdbd'}
                paddingX={5}
              >
                <Stack direction="column">
                  <Typography variant={'h4'} color={'#333'} textAlign={'left'}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                
                  <Typography variant={'h5'} color={'#333'} textAlign={'left'}>
                    Quantity: {quantity}
                  </Typography>
                
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" 
                      sx={{ backgroundColor: '#263226', color: '#fff', '&:hover': { backgroundColor: '#596559' } }} 
                      onClick={() => addItem(name.toLowerCase())}>
                      Add
                    </Button>
                    <Button variant="contained" 
                      sx={{ backgroundColor: '#263226', color: '#fff', '&:hover': { backgroundColor: '#596559' } }} 
                      onClick={() => removeItem(name.toLowerCase())}>
                      Remove
                    </Button>
                    <Button variant="contained" 
                      sx={{ backgroundColor: '#263226', color: '#fff', '&:hover': { backgroundColor: '#596559' } }} 
                      onClick={() => handleOpenEdit(name.toLowerCase())}>
                      Edit
                    </Button>

                    <Modal
                      open={editOpen}
                      onClose={handleCloseEdit}
                      aria-labelledby="modal-modal-title"
                      aria-describedby="modal-modal-description"
                    >
                      <Box sx={{ p: 2, bgcolor: 'background.paper', width: 400, margin: 'auto', mt: '15%' }}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                          Edit Quantity of {currentItem ? currentItem.charAt(0).toUpperCase() + currentItem.slice(1) : ''}
                        </Typography>
                        <Stack width="100%" direction="row" spacing={2} mt={2}>
                          <TextField
                            aria-label="Quantity Input"
                            placeholder="Type a number…"
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            type="number"
                            InputProps={{ inputProps: { min: 0 } }} // enforce non-negative values
                            fullWidth
                          />
                          <Button
                            variant="outlined"
                            onClick={() =>  {
                              if (currentItem) {
                                editItem(currentItem, parseInt(val));
                              }
                              setVal(''); 
                              handleCloseEdit();
                            }}>
                            Save
                          </Button>
                        </Stack>
                      </Box>
                    </Modal>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
            ))}
          </Stack>
        </Box>

    </Box>
  )
}
