// components/modals/ReplyModal.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';

// material-ui
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    CircularProgress,
    InputLabel,
} from '@mui/material';

// third-party
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';
import { toast } from 'utils/toast';


export default function ReplyModal({
    open,
    onClose,
    ticketId,
    addReplyMutation,
}) {
    const [reply, setReply] = useState('');
    const [files, setFiles] = useState([]);

    const isPending = addReplyMutation.isPending;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reply.trim()) {
            return toast({
                message: 'Reply cannot be empty',
                type: 'error'
            });
        }

        try {
            await addReplyMutation.mutateAsync({
                message: reply,
                files,
            });

            setReply('');
            setFiles([]);
            toast({
                message: 'Reply sent!',
                type: 'success'
            });
            onClose();
        } catch (err) {
            toast({
                message: err.message || 'Failed to send reply',
                type: 'error'
            });
        }
    };

    const handleCancel = () => {
        setReply('');
        setFiles([]);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleCancel}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit,
            }}
        >
            <DialogTitle>Post a Reply</DialogTitle>

            <DialogContent>
                <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Rich Text Editor */}
                    <div>
                        <InputLabel sx={{ mb: 0.5 }}>Message *</InputLabel>
                        <ReactQuill
                            value={reply}
                            onChange={setReply}
                            placeholder="Write your reply..."
                            modules={{
                                toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ['bold', 'italic', 'underline'],
                                    ['link', 'image'],
                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                    ['clean'],
                                ],
                            }}
                            style={{ height: 120, marginBottom: 48 }}
                            disabled={isPending}
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <InputLabel sx={{ mb: 0.5 }}>Attachments (optional)</InputLabel>
                        <UploadMultiFile
                            files={files}
                            setFieldValue={(_, newFiles) => setFiles(newFiles)}
                            showList
                            disabled={isPending}
                        />
                    </div>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleCancel} color="error" disabled={isPending}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isPending || !reply.trim()}
                >
                    {isPending ? <CircularProgress size={24} /> : 'Send Reply'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ReplyModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    ticketId: PropTypes.string.isRequired,
    addReplyMutation: PropTypes.object.isRequired,
};