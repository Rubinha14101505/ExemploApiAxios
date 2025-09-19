import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

// URL base da API para os compromissos
const API_BASE_URL = "http://10.110.12.43:3000/appointments";

// Componente principal da aplicação
export default function App() {

  // Estado para armazenar a lista de compromissos
  const [appointments, setAppointments] = useState([]);

  // Estado para controlar a visibilidade do modal
  const [modalVisible, setModalVisible] = useState(false);

  // Estado para armazenar o compromisso que está sendo editado (null se for um novo)
  const [editingAppointment, setEditingAppointment] = useState(null);
  
  // Estados para os campos do formulário
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState('pendente');
  // Estados para controlar a exibição dos seletores de data e hora
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Função para buscar todos os compromissos da API
  const fetchAppointments = async () => {
    try {
      // Faz uma requisição GET para a API
      const response = await axios.get(API_BASE_URL);
      // Atualiza o estado com os dados recebidos
      setAppointments(response.data);
    } catch (error) {
      // Exibe erro no console caso ocorra algum problema
      console.error("Erro ao buscar compromissos:", error.message);
    }
  };

  // Função para criar um novo compromisso
  const createAppointment = async () => {
    try {
      // Prepara os dados do compromisso para enviar à API
      const appointmentData = {
        title,
        notes,
        // Formata a data para o formato AAAA-MM-DD
        date: date.toISOString().split('T')[0],
        // Formata a hora para o formato HH:MM
        time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status
      };

      // Faz uma requisição POST para criar o compromisso
      await axios.post(API_BASE_URL, appointmentData);
      // Limpa o formulário
      resetForm();
      // Fecha o modal
      setModalVisible(false);
      // Recarrega a lista de compromissos
      fetchAppointments();
    } catch (error) {
      // Exibe erro no console caso ocorra algum problema
      console.error("Erro ao criar compromisso:", error.message);
    }
  };

  // Função para atualizar um compromisso existente
  const updateAppointment = async () => {
    try {
      // Prepara os dados atualizados do compromisso
      const appointmentData = {
        title,
        notes,
        // Formata a data para o formato AAAA-MM-DD
        date: date.toISOString().split('T')[0],
        // Formata a hora para o formato HH:MM
        time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status
      };

      // Faz uma requisição PUT para atualizar o compromisso
      await axios.put(`${API_BASE_URL}/${editingAppointment.id}`, appointmentData);
      // Limpa o formulário
      resetForm();
      // Fecha o modal
      setModalVisible(false);
      // Recarrega a lista de compromissos
      fetchAppointments();
    } catch (error) {
      // Exibe erro no console caso ocorra algum problema
      console.error("Erro ao atualizar compromisso:", error.message);
    }
  };

  // Função para excluir um compromisso
  const deleteAppointment = async (id) => {
    try {
      // Faz uma requisição DELETE para remover o compromisso
      await axios.delete(`${API_BASE_URL}/${id}`);
      // Recarrega a lista de compromissos
      fetchAppointments();
    } catch (error) {
      // Exibe erro no console caso ocorra algum problema
      console.error("Erro ao excluir compromisso:", error.message);
    }
  };

  // Função para limpar o formulário
  const resetForm = () => {
    setTitle('');
    setNotes('');
    setDate(new Date());
    setTime(new Date());
    setStatus('pendente');
    setEditingAppointment(null);
  };

  // Função para abrir o modal no modo de edição
  const openEditModal = (appointment) => {
    // Preenche o formulário com os dados do compromisso selecionado
    setEditingAppointment(appointment);
    setTitle(appointment.title);
    setNotes(appointment.notes);
    // Converte a string de data para um objeto Date
    setDate(new Date(appointment.date));
    // Converte a string de hora para um objeto Date (usa uma data fixa como base)
    setTime(new Date(`2000-01-01T${appointment.time}`));
    setStatus(appointment.status);
    // Abre o modal
    setModalVisible(true);
  };

  // Função para fechar o modal e limpar o formulário
  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  // Função para formatar a data para exibição
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Função para obter a cor correspondente ao status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#FFA500'; // Laranja
      case 'agendado': return '#1E90FF'; // Azul
      case 'concluído': return '#32CD32'; // Verde
      default: return '#666'; // Cinza
    }
  };

  // useEffect para carregar os compromissos quando o componente é montado
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Renderização do componente
  return (
    <View style={styles.container}>
      {/* Cabeçalho da aplicação */}
      <Text style={styles.header}>Agenda de Compromissos</Text>
      
      {/* Botão para abrir o modal de novo compromisso */}
      <Button title="Novo Compromisso" onPress={() => setModalVisible(true)} />
      
      {/* Lista de compromissos */}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            {/* Cabeçalho do item com título e status */}
            <View style={styles.appointmentHeader}>
              <Text style={styles.appointmentTitle}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            {/* Anotações do compromisso */}
            <Text style={styles.appointmentNotes}>{item.notes}</Text>
            
            {/* Detalhes do compromisso (data e hora) */}
            <View style={styles.appointmentDetails}>
              <Text style={styles.detailText}>Data: {formatDate(item.date)}</Text>
              <Text style={styles.detailText}>Hora: {item.time}</Text>
            </View>
            
            {/* Ações do compromisso (editar e excluir) */}
            <View style={styles.appointmentActions}>
              <Button title="Editar" onPress={() => openEditModal(item)} />
              <Button title="Excluir" color="#FF4500" onPress={() => deleteAppointment(item.id)} />
            </View>
          </View>
        )}
      />

      {/* Modal para adicionar/editar compromissos */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingAppointment ? 'Editar Compromisso' : 'Novo Compromisso'}
          </Text>
          
          {/* Campo de entrada para o título */}
          <TextInput
            style={styles.input}
            placeholder="Título do compromisso"
            value={title}
            onChangeText={setTitle}
          />
          
          {/* Campo de entrada para as anotações (multilinha) */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Anotações"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          
          {/* Seletor de data */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Data:</Text>
            <Button 
              title={date.toLocaleDateString('pt-BR')} 
              onPress={() => setShowDatePicker(true)} 
            />
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
          
          {/* Seletor de hora */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Hora:</Text>
            <Button 
              title={time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
              onPress={() => setShowTimePicker(true)} 
            />
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
          
          {/* Seletor de status */}
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
          
          {/* Botões de ação do modal */}
          <View style={styles.modalButtons}>
            <Button
              title={editingAppointment ? "Atualizar" : "Criar"}
              onPress={editingAppointment ? updateAppointment : createAppointment}
            />
            <Button title="Cancelar" color="#666" onPress={closeModal} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

// ESTILIZAÇÃO
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fad0dd',
  },
  // Estilo do cabeçalho
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 25,
    color: '#003424',
    letterSpacing: 0.5,
  },
  // Estilo da lista
  list: {
    marginTop: 20,
  },
  // Estilo do item de compromisso - cartão com sombra suave
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
    borderLeftColor: '#f17ea1', // Borda lateral colorida
  },
  // Estilo do cabeçalho do item
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Estilo do título do compromisso
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
    color: '#2d3748',
  },
  // Estilo do badge de status - mais arredondado
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, // Mais arredondado
  },
  // Estilo do texto do status
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Estilo das anotações
  appointmentNotes: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
    lineHeight: 20,
  },
  // Estilo dos detalhes (data e hora)
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },
  // Estilo do texto dos detalhes
  detailText: {
    fontSize: 13,
    color: '#4a5568',
  },
  // Estilo das ações (botões editar e excluir)
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  // Botões com novo visual
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#4299e1',
  },
  deleteButton: {
    backgroundColor: '#e53e3e',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 5,
  },
  // Estilo do container do modal
  modalContainer: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fad0dd',
  },
  // Novo estilo para o conteúdo do modal
  modalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  // Estilo do título do modal
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#003424',
  },
  // Estilo dos campos de entrada - mais modernos
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f7fafc',
  },
  // Estilo da área de texto (anotações)
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  // Estilo do container dos seletores
  pickerContainer: {
    marginBottom: 20,
  },
  // Estilo dos rótulos
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#4a5568',
  },
  // Estilo do seletor (Picker) - mais moderno
  picker: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f7fafc',
    padding: 10,
  },
  // Estilo dos botões do modal - novo design
  modalButtons: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
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
    fontWeight: '500',
    fontSize: 16,
  },
});

