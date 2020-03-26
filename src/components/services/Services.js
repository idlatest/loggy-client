import React, { useState } from 'react';

import { ErrorPlaceholder, Placeholder } from 'components/UI/placeholder/Placeholder';
import InputField from 'components/UI/inputField/InputField';
import Dropdown from 'components/UI/dropdown/Dropdown';
import Stepper from 'components/UI/stepper/Stepper';
import Adapter from 'components/UI/adapter/Adapter';
import Button from 'components/UI/button/Button';
import Modal from 'components/UI/modal/Modal';

import fetchClient from 'fetchClient';
import { useStore } from 'context';
import config from 'config';

import styling from './Services.module.scss';

const Services = ({ history }) => {
    const [store, dispatch] = useStore();
    
    
    const [{ modalVisible, name, type, description, error }, setState] = useState({
        isLoading: false,
        modalVisible: false,
        name: '',
        type: '',
        description: '',
        error: ''
    });
    
    
    /**
     * Opens the modal.
     */
    const openModal = () => setState(prevState => ({ ...prevState, modalVisible: true }));
    
    
    /**
     * Closes the modal.
     */
    const closeModal = () => setState(prevState => ({
        ...prevState,
        modalVisible: false,
        name: '',
        type: '',
        description: ''
    }));
    
    
    /**
     * Handles input field changes.
     * @param name {string} name of the input field
     * @param value {string} value that was typed in into the input field
     */
    const changeHandler = ({ target: { name, value } }) => {
        setState(prevState => ({ ...prevState, [name]: value }));
    };
    
    
    /**
     * Handles dropdown changes.
     * @param value {string} selected type
     */
    const selectHandler = (value) => setState(prevState => ({ ...prevState, type: value }));
    
    
    /**
     * Creates a new service.
     * @returns {Promise<void>}
     */
    const createService = async () => {
        try {
            setState(prevState => ({ ...prevState, isLoading: true, modalVisible: false }));
            
            const res = await fetchClient('createService', { name, type, description });
            
            if (res.message) {
                throw new Error(res.message);
            }
            
            if (!res.id) {
                throw new Error('failed to create new service');
            }
            
            const services = [...store.services, res];
            
            setState(prevState => ({ ...prevState, isLoading: false }));
            dispatch({ type: 'update', payload: { services } });
            
        } catch (error) {
            console.error(error);
            setState(prevState => ({ ...prevState, isLoading: false, error: error.message }));
        }
    };
    
    
    // All available types with icon
    const types = config.availableTypes.map(type => {
        const item = (
            <>
                <Adapter type={type.name} size='small' />
                {type.label}
            </>
        
        );
        
        return { key: item, value: type.name, id: type.name };
    });
    
    
    const inputIsValid = name && type && config.regex.description.test(description);
    
    
    const services = (
        <section className={styling.services}>
            {store.services.map(service => (
                <div
                    key={service.id}
                    className={styling.service}
                    onClick={() => history.push('/services/' + service.id)}
                >
                    <Adapter type={service.type} size='large' />
                    
                    <div>{service.name}</div>
                    
                    <p>{service.description}</p>
                </div>
            ))}
        </section>
    );
    
    
    const placeholder = (
        <Placeholder title='No services available'>
            <h4>Create your first service and get started</h4>
            
            <Button onClick={openModal}>New Service</Button>
        </Placeholder>
    );
    
    
    return (
        <>
            <Stepper steps={['services']} />
            
            <section className={styling.header}>
                <div>
                    <h5>{store.organization.name}</h5>
                    <h1>All Services</h1>
                </div>
                
                <Button onClick={openModal}>New Service</Button>
            </section>
            
            {(store.services.length && !error) && services}
            {(!store.services.length && !error) && placeholder}
            {error && <ErrorPlaceholder title={error} />}
            
            <Modal open={modalVisible}>
                <h3 className={styling.title}>Create a new Service</h3>
                
                <div className={styling.split}>
                    <div className={styling.cell}>
                        <span className={styling.label}>Name</span>
                        
                        <InputField
                            name='name'
                            value={name}
                            placeholder='Service Name'
                            onChange={changeHandler}
                            test={config.regex.notEmpty}
                        />
                    </div>
                    
                    <div className={styling.cell}>
                        <span className={styling.label}>Type</span>
                        
                        <Dropdown
                            items={types}
                            selected={type}
                            label='Select Type'
                            changeHandler={selectHandler}
                            type='thin'
                        />
                    </div>
                </div>
                
                <span className={styling.label}>Description</span>
                <InputField
                    name='description'
                    value={description}
                    placeholder='Service Description'
                    onChange={changeHandler}
                    test={config.regex.description}
                />
                
                <div className={styling.controls}>
                    <Button size='smaller' color='light' onClick={closeModal}>Cancel</Button>
                    <Button size='smaller' onClick={createService} disabled={!inputIsValid}>Create</Button>
                </div>
            </Modal>
        </>
    );
};

export default Services;