import './ManageQuiz.scss';
import Select from 'react-select';
import { useState } from 'react';

function ManageQuiz(props) {

    const options = [
        { value: 'EASY', label: 'EASY' },
        { value: 'MEDIUM', label: 'MEDIUM' },
        { value: 'HARD', label: 'HARD' },
    ];
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('EASY');
    const [image, setImage] = useState(null);

    const handleOnChangeImg = (event) => {

    };

    return (
        <div className='quiz-container'>
            <div className='title'>Manage Quizzes</div>
            <hr></hr>
            <div className='add-new'>
                <fieldset className="border rounded-3 p-3" >
                    <legend className="float-none w-auto px-3">Add new Quiz</legend>
                    <div className="form-floating mb-3">
                        <input type="text" className="form-control" placeholder="Your quiz name" value={name} onChange={(event) => setName(event.target.value)} />
                        <label>Name</label>
                    </div>
                    <div className="form-floating">
                        <input type="text" className="form-control" placeholder="Quiz description..." value={description} onChange={(event) => setDescription(event.target.value)} />
                        <label>Description</label>
                    </div>
                    <div className='my-3'>
                        <Select value={type} options={options} placeholder='Quiz difficulty...' />
                    </div>
                    <div className='more-actions'>
                        <label className='mb-1'>Upload Image</label>
                        <input type={'file'} className="form-control" onChange={(event) => handleOnChangeImg(event)} />
                    </div>
                </fieldset>
            </div>
            <div className='list-detail'>

            </div>
        </div>
    );
}

export default ManageQuiz;