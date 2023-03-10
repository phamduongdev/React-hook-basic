import _ from "lodash";
import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useTranslation } from 'react-i18next';

function ModalViewUser(props) {

    const { show, setShow, userUpdate, resetUpdateData } = props;
    const { t } = useTranslation();
    const handleShow = () => setShow(true);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [previewImg, setPreviewImg] = useState('');

    const handleClose = () => {
        setShow(false);
        setEmail('');
        setPassword('');
        setUsername('');
        setRole('USER');
        setPreviewImg('');
        resetUpdateData();
    };

    useEffect(() => {
        if (!_.isEmpty(userUpdate)) {
            setEmail(userUpdate.email);
            setPassword(`Don't even think about that!`);
            setUsername(userUpdate.username);
            setRole(userUpdate.role);
            if (userUpdate.image) {
                setPreviewImg(`data:image/jpeg;base64,${userUpdate.image}`);
            }
        }
    }, [userUpdate]);

    return (
        <>
            <Modal className="modal-add-user" show={show} onHide={handleClose} size='xl' backdrop='static'>
                <Modal.Header closeButton>
                    <Modal.Title>{t('admin.feature.manage-user.modal-view.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input type="email" disabled className="form-control" value={email} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">{t('admin.feature.manage-user.modal-view.username')}</label>
                            <input type="text" disabled className="form-control" value={username} onChange={(event) => setUsername(event.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">{t('admin.feature.manage-user.modal-view.password')}</label>
                            <input type="password" disabled className="form-control" value={password} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">{t('admin.feature.manage-user.modal-view.role')}</label>
                            <select className="form-select" disabled value={role} onChange={(event) => setRole(event.target.value)}>
                                <option value={'USER'}>USER</option>
                                <option value={'ADMIN'}>ADMIN</option>
                            </select>
                        </div>
                        <div className="col-md-12 img-preview">
                            {previewImg ?
                                <img src={previewImg} alt="previewImage" />
                                :
                                <span>{t('admin.feature.manage-user.modal-view.preview-img')}</span>
                            }
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        {t('admin.feature.manage-user.modal-view.btn-close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalViewUser;