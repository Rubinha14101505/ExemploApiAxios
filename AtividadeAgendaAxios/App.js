import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const API_BASE_URL = "http://10.110.12.43:3000/appointments";

export default function App() {

  const [appointments, setAppointments] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);

  const [editingAppointment, setEditingAppointment] = useState(null);
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState('pendente');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setAppointments(response.data);
    } catch (error) {
      console.error("Erro ao buscar compromissos:", error.message);
    }
  };

  const createAppointment = async () => {
    try {
      const appointmentData = {
        title,
        notes,
        date: date.toISOString().split('T')[0],
        time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status
      };

      await axios.post(API_BASE_URL, appointmentData);
      resetForm();
      setModalVisible(false);
      fetchAppointments();
    } catch (error) {
      console.error("Erro ao criar compromisso:", error.message);
    }
  };

  const updateAppointment = async () => {
    try {
      const appointmentData = {
        title,
        notes,
        date: date.toISOString().split('T')[0],
        time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status
      };

      await axios.put(`${API_BASE_URL}/${editingAppointment.id}`, appointmentData);
      resetForm();
      setModalVisible(false);
      fetchAppointments();
    } catch (error) {
      console.error("Erro ao atualizar compromisso:", error.message);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      fetchAppointments();
    } catch (error) {
      console.error("Erro ao excluir compromisso:", error.message);
    }
  };

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setDate(new Date());
    setTime(new Date());
    setStatus('pendente');
    setEditingAppointment(null);
  };

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setTitle(appointment.title);
    setNotes(appointment.notes);
    setDate(new Date(appointment.date));
    setTime(new Date(`2000-01-01T${appointment.time}`));
    setStatus(appointment.status);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#FFA500'; // laranja
      case 'agendado': return '#1E90FF'; // azul
      case 'concluído': return '#32CD32'; // verde
      default: return '#666'; // cinza
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Agenda de Compromissos</Text>
      
      {/* BOTÃO "NOVO COMPROMISSO" */}
      <TouchableOpacity 
        style={styles.newAppointmentButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.newAppointmentButtonText}> Adicionar Evento</Text>
      </TouchableOpacity>
      
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.appointmentTitle}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            <Text style={styles.appointmentNotes}>{item.notes}</Text>
            
            <View style={styles.appointmentDetails}>
              <Text style={styles.detailText}>Data: {formatDate(item.date)}</Text>
              <Text style={styles.detailText}>Hora: {item.time}</Text>
            </View>
            
            <View style={styles.appointmentActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteAppointment(item.id)}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingAppointment ? 'Editar Compromisso' : 'Novo Evento'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Título"
            value={title}
            onChangeText={setTitle}
          />
          
          {/* Campo de anotações com novo estilo */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Descrição</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Escreva a descrição aqui"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>
          
          {/* BOTÕES DE DATA E HORA */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Data:</Text>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)} 
            >
              <Text style={styles.dateTimeButtonText}>{date.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </View>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Hora:</Text>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)} 
            >
              <Text style={styles.dateTimeButtonText}>
                {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTime(selectedTime);
                }}
              />
            )}
          </View>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Status:</Text>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Pendente" value="pendente" />
              <Picker.Item label="Agendado" value="agendado" />
              <Picker.Item label="Concluído" value="concluído" />
            </Picker>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={editingAppointment ? updateAppointment : createAppointment}
            >
              <Text style={styles.modalButtonText}>
                {editingAppointment ? "Atualizar" : "Criar"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={closeModal}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

// ESTILIZAÇÃO
const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fad0dd',
  },

  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 25,
    color: '#003424',
    letterSpacing: 0.5,
  },

  // ESTILO PARA O BOTÃO "NOVO COMPROMISSO"
  newAppointmentButton: {
    backgroundColor: '#f17ea1',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  newAppointmentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  list: {
    marginTop: 20,
  },

  appointmentItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#4a5568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#f17ea1', 
  },

  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  appointmentTitle: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
    color: '#2d3748',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, 
  },

  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  appointmentNotes: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
    lineHeight: 20,
  },

  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },

  detailText: {
    fontSize: 13,
    color: '#4a5568',
  },

  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },

  // Estilo para botões de ação (Editar/Excluir)
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4299e1',
  },
  deleteButton: {
    backgroundColor: '#e53e3e',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  modalContainer: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fad0dd',
  },
  
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#003424',
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f7fafc',
  },
  
  notesContainer: {
    marginBottom: 20,
  },
  
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#003424',
  },
  
  notesInput: {
    borderWidth: 1,
    borderColor: '#ff9ebb',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  pickerContainer: {
    marginBottom: 20,
  },
  
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#4a5568',
  },

  // BOTÕES DE DATA/HORA
  dateTimeButton: {
    backgroundColor: '#f8a5c2',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f17ea1',
    alignItems: 'center',
  },

  dateTimeButtonText: {
    color: '#003424',
    fontSize: 16,
    fontWeight: '600',
  },
  
  picker: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f7fafc',
    padding: 10,
  },
  
  modalButtons: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },

  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#a0aec0',
  },
  saveButton: {
    backgroundColor: '#48bb78',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});