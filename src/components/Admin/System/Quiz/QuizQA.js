import { useEffect, useState } from "react";
import Select from "react-select";
import { BsFillPatchPlusFill, BsFillPatchMinusFill } from 'react-icons/bs';
import { AiFillPlusCircle, AiFillMinusCircle } from 'react-icons/ai';
import { RiImageAddFill } from 'react-icons/ri';
import { v4 as uuidv4 } from 'uuid';
import './QuizQA.scss';
import { getAllQuizAdmin, getQuizWithQA, upSertQA } from "../../../../services/apiServices";
import Lightbox from "react-awesome-lightbox";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import _ from "lodash";

function QuizQA(props) {

    const { t } = useTranslation();
    const initQuestions = [
        {
            id: uuidv4(),
            description: '',
            imageFile: '',
            imageName: '',
            answers: [
                {
                    id: uuidv4(),
                    description: '',
                    isCorrect: false
                }
            ]
        }
    ];
    const [questions, setQuestions] = useState(initQuestions);
    const [isPreviewImg, setIsPreviewImg] = useState(false);
    const [dataImgPreview, setDataImgPreview] = useState({
        title: '',
        url: ''
    });
    const [listQuiz, setListQuiz] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState({});

    useEffect(() => {
        getAllQuiz();
    }, []);

    useEffect(() => {
        if (selectedQuiz && selectedQuiz.value) {
            fetchQuizWithQA();
        }
    }, [selectedQuiz]);

    const getAllQuiz = async () => {
        let res = await getAllQuizAdmin();
        if (res && res.EC === 0) {
            let newQuiz = res.DT.map(item => {
                return {
                    value: item.id,
                    label: `${item.id} - ${item.description}`
                };
            });
            setListQuiz(newQuiz);
        }
    };

    function urltoFile(url, filename, mimeType) {
        return (fetch(url)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
        );
    }

    const fetchQuizWithQA = async () => {
        let res = await getQuizWithQA(selectedQuiz.value);
        if (res && res.EC === 0) {
            //convert base64 to file obj
            let newQA = [];
            for (let i = 0; i < res.DT.qa.length; i++) {
                let question = res.DT.qa[i];
                if (question.imageFile) {
                    question.imageName = `Question-${question.id}.png`;
                    question.imageFile = await urltoFile(`data:image/png;base64,${question.imageFile}`, `Question-${question.id}.png`, 'image/png');
                }
                newQA.push(question);
            }
            setQuestions(newQA);
        }
    };

    const handleOnChange = (questionId, answerId, type, value) => {
        if (type === 'QUESTION') {
            let copiedQuestions = _.cloneDeep(questions);
            let index = copiedQuestions.findIndex(item => item.id === questionId);
            if (index > -1) {
                copiedQuestions[index].description = value;
                setQuestions(copiedQuestions);
            }
        }
    };

    const handleOnChangeFileQuestion = (questionId, event) => {
        let copiedQuestions = _.cloneDeep(questions);
        let index = copiedQuestions.findIndex(item => item.id === questionId);
        if (index > -1 && event.target && event.target.files && event.target.files[0]) {
            copiedQuestions[index].imageFile = event.target.files[0];
            copiedQuestions[index].imageName = event.target.files[0].name;
            setQuestions(copiedQuestions);
        }
    };

    const handleAnswerQuestion = (type, questionId, answerId, value) => {
        let copiedQuestions = _.cloneDeep(questions);
        let index = copiedQuestions.findIndex(item => item.id === questionId);
        if (index > -1) {
            copiedQuestions[index].answers = copiedQuestions[index].answers.map(answer => {
                if (answer.id === answerId) {
                    if (type === 'CHECKBOX') {
                        answer.isCorrect = value;
                    } else if (type === 'INPUT') {
                        answer.description = value;
                    }
                }
                return answer;
            });
            setQuestions(copiedQuestions);
        }
    };

    const handleAddRemoveQuestion = (answerId, type) => {
        if (type === 'ADD') {
            const newQuestion =
            {
                id: uuidv4(),
                description: '',
                imageFile: '',
                imageName: '',
                answers: [
                    {
                        id: uuidv4(),
                        description: '',
                        isCorrect: false
                    }
                ]
            };
            setQuestions([...questions, newQuestion]);
        } else if (type === 'REMOVE') {
            let copiedQuestions = _.cloneDeep(questions);
            copiedQuestions = copiedQuestions.filter(item => item.id !== answerId);
            setQuestions(copiedQuestions);
        }
    };

    const handleAddRemoveAnswer = (questionId, answerId, type) => {
        let copiedQuestions = _.cloneDeep(questions);
        if (type === 'ADD') {
            const newAnswer =
            {
                id: uuidv4(),
                description: '',
                isCorrect: false
            };
            let index = copiedQuestions.findIndex(item => item.id === questionId);
            if (index > -1) {
                copiedQuestions[index].answers.push(newAnswer);
                setQuestions(copiedQuestions);
            }
        } else if (type === 'REMOVE') {
            let index = copiedQuestions.findIndex(item => item.id === questionId);
            if (index > -1) {
                copiedQuestions[index].answers = copiedQuestions[index].answers.filter(item => item.id !== answerId);
                setQuestions(copiedQuestions);
            }
        }
    };

    const handlePreviewImg = (questionId) => {
        let copiedQuestions = _.cloneDeep(questions);
        let index = copiedQuestions.findIndex(item => item.id === questionId);
        if (index > -1) {
            setDataImgPreview({
                title: copiedQuestions[index].imageName,
                url: URL.createObjectURL(copiedQuestions[index].imageFile)
            });
            setIsPreviewImg(true);
        }
    };

    const toBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmitQuestionForQuiz = async () => {
        if (_.isEmpty(selectedQuiz)) {
            toast.error('Please choose a Quiz!');
            return;
        }
        let isValidQuestion = true;
        let indexQuestion = 0;
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].description) {
                isValidQuestion = false;
                indexQuestion = i;
                break;
            }
        }
        if (!isValidQuestion) {
            toast.error(`Not allowed empty description for Question ${indexQuestion + 1}`);
            return;
        }
        let isValidAnswer = true;
        let indexQuestion1 = 0, indexAnswer = 0;
        for (let i = 0; i < questions.length; i++) {
            for (let j = 0; j < questions[i].answers.length; j++) {
                if (!questions[i].answers[j].description) {
                    isValidAnswer = false;
                    indexAnswer = j;
                    break;
                }
            }
            indexQuestion1 = i;
            if (!isValidAnswer) {
                break;
            }
        }
        if (!isValidAnswer) {
            toast.error(`Not allowed empty Answer ${indexAnswer + 1} at Question ${indexQuestion1 + 1}`);
            return;
        }
        let copiedQuestions = _.cloneDeep(questions);
        for (let i = 0; i < copiedQuestions.length; i++) {
            if (copiedQuestions[i].imageFile) {
                copiedQuestions[i].imageFile = await toBase64(copiedQuestions[i].imageFile);
            }
        }
        let res = await upSertQA({
            quizId: selectedQuiz.value,
            questions: copiedQuestions
        });
        if (res && res.EC === 0) {
            toast.success(res.EM);
            fetchQuizWithQA();
        }
    };

    return (
        <div className="questions-container">
            <div className="add-new-question">
                <div className="col-6 form-group">
                    <label className="mb-2">{t('admin.feature.manage-quiz.update.title-select')}</label>
                    <Select value={selectedQuiz} onChange={setSelectedQuiz} options={listQuiz} placeholder='' />
                </div>
                <div className="mt-3 mb-2">{t('admin.feature.manage-quiz.update.add-question')}</div>
                {questions && questions.length > 0 &&
                    questions.map((question, index) => {
                        return (
                            <div key={question.id} className="question-main mb-4">
                                <div className="questions-content">
                                    <div className="form-floating description">
                                        <input type="text" className="form-control" placeholder={t('admin.feature.manage-quiz.update.question')} value={question.description} onChange={(event) => handleOnChange(question.id, '', 'QUESTION', event.target.value)} />
                                        <label>{t('admin.feature.manage-quiz.update.question')}{index + 1}</label>
                                    </div>
                                    <div className="group-upload">
                                        <label className="label-up" htmlFor={`${question.id}`}><RiImageAddFill /></label>
                                        <input type={'file'} id={`${question.id}`} hidden onChange={(event) => handleOnChangeFileQuestion(question.id, event)} />
                                        <span>
                                            {question.imageName ? <span onClick={() => handlePreviewImg(question.id)}>{question.imageName}</span> : t('admin.feature.manage-quiz.update.title-img')}
                                        </span>
                                    </div>
                                    <div className="btn-add-question">
                                        <span onClick={() => handleAddRemoveQuestion('', 'ADD')}>
                                            <BsFillPatchPlusFill className="icon-add" />
                                        </span>
                                        {questions.length > 1 &&
                                            <span onClick={() => handleAddRemoveQuestion(question.id, 'REMOVE')}>
                                                <BsFillPatchMinusFill className="icon-remove" />
                                            </span>
                                        }
                                    </div>
                                </div>
                                {question.answers && question.answers.length > 0 &&
                                    question.answers.map((answer, index) => {
                                        return (
                                            <div key={answer.id}
                                                className="answers-content">
                                                <input className="form-check-input isCorrect" checked={answer.isCorrect} onChange={(event) => handleAnswerQuestion('CHECKBOX', question.id, answer.id, event.target.checked)} type="checkbox" />
                                                <div className="form-floating answer-name">
                                                    <input type="text" className="form-control" placeholder={`${answer.description} `} value={answer.description} onChange={(event) => handleAnswerQuestion('INPUT', question.id, answer.id, event.target.value)} />
                                                    <label>{t('admin.feature.manage-quiz.update.answer')}{index + 1}</label>
                                                </div>
                                                <div className="btn-add-answer">
                                                    <span onClick={() => handleAddRemoveAnswer(question.id, '', 'ADD')}>
                                                        <AiFillPlusCircle className="icon-add" />
                                                    </span>
                                                    {question.answers.length > 1 &&
                                                        <span onClick={() => handleAddRemoveAnswer(question.id, answer.id, 'REMOVE')}>
                                                            <AiFillMinusCircle className="icon-remove" />
                                                        </span>
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        );
                    })
                }
                {questions && questions.length > 0 &&
                    <div>
                        <button onClick={() => handleSubmitQuestionForQuiz()} className="btn btn-warning">{t('admin.feature.manage-quiz.update.btn-save')}</button>
                    </div>
                }
                {isPreviewImg &&
                    <Lightbox image={dataImgPreview.url} title={dataImgPreview.title} onClose={() => setIsPreviewImg(false)}></Lightbox>
                }
            </div>
        </div>
    );
}

export default QuizQA;