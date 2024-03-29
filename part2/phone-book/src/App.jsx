import { useState, useEffect } from 'react'
import personService from './services/persons';
import Person from './components/Person';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newSearchWord, setNewSearchWord] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);


  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons);
      })
  }, []);

  const addPerson = (event) => {
    event.preventDefault();
    const alreadyAdded = persons.find(person => person.name === newName);

    if (alreadyAdded) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const changedPerson = { ...alreadyAdded, number: newNumber };
        const id = changedPerson.id;

        personService
          .update(id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== id ? person : returnedPerson));
            setNewName('');
            setNewNumber('');
            setSuccessMessage(`Changed ${newName}'s number to ${newNumber}`);
            setTimeout(() => {
              setSuccessMessage(null)
            }, 5000);
          }).catch(error => {
            setErrorMessage(`Information of ${newName} has alreaedy been removed from server`);
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000);
            setPersons(persons.filter(person => person.id !== id));
          })
      }
    } else {
      const personObject = {
        name: newName,
        number: newNumber,
      }

      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson));
          setNewName('');
          setNewNumber('');
          setSuccessMessage(`Added ${personObject.name}`);
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000);
        })
    }
  }

  const toggleDeleteOf = id => {
    const person = persons.find(person => person.id === id);
    if (!person) {

    }

    if (window.confirm(`Delete ${person.name} ?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
        })
        .catch(error => {
          alert(`this person has already been delete`);
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  }

  const handleSearchWordChange = (event) => {
    setNewSearchWord(event.target.value);
  }

  const filteredPersons = persons.filter(person => person.name.toLocaleLowerCase().includes(newSearchWord.toLocaleLowerCase()));

  return (
    <div>
      <h2>Phonebook</h2>
      <SucessNotification successMessage={successMessage} />
      <ErrorNotification errorMessage={errorMessage} />

      <Filter label="filter shown with" newSearchWord={newSearchWord} handleSearchWordChange={handleSearchWordChange} />

      <h2>add a new</h2>
      <PersonForm newName={newName} newNumber={newNumber} addPerson={addPerson} handleNameChange={handleNameChange} handleNumberChange={handleNumberChange} />

      <h2>Numbers</h2>
      <Persons filteredPersons={filteredPersons} toggleDeleteOf={toggleDeleteOf} />
    </div >
  )
}

const Filter = ({ label, newSearchWord, handleSearchWordChange }) => {
  return (
    <form>
      <div>{label} <input value={newSearchWord} onChange={handleSearchWordChange} /></div>
    </form>
  )
}

const PersonForm = ({ newName, newNumber, addPerson, handleNameChange, handleNumberChange }) => {
  return (
    <form onSubmit={addPerson}>
      <div>name <input value={newName} onChange={handleNameChange} /></div>
      <div>number <input value={newNumber} onChange={handleNumberChange} /></div>
      <div><button type="submit">add</button></div>
    </form>
  )
}

//const Persons = ({ filteredPersons }) => filteredPersons.map(person => <Person key={person.id} person={person} />);
const Persons = ({ filteredPersons, toggleDeleteOf }) => {
  return (
    <>
      {filteredPersons.map(person => <Person key={person.id} person={person} toggleDelete={() => toggleDeleteOf(person.id)} />)}
    </>
  )
}

const SucessNotification = ({ successMessage }) => {
  if (successMessage === null) {
    return null;
  }
  return (
    <div className="sucess">
      {successMessage}
    </div>
  )
}

const ErrorNotification = ({ errorMessage }) => {
  if (errorMessage === null) {
    return null;
  }
  return (
    <div className="error">
      {errorMessage}
    </div>
  )
}

export default App

//https://www.joshbritz.co/posts/why-its-so-hard-to-check-object-equality/