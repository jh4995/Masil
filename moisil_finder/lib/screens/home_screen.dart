// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_ble_peripheral/flutter_ble_peripheral.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:math';

import 'finder_screen.dart';
import 'package:uuid/uuid.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // 1. 변수 선언은 클래스 상단에 한번만!
  bool _isBroadcasting = false;
  String _meetingCode = '';
  bool _isLoading = false; // 버튼 클릭 시 로딩 상태를 표시하기 위한 변수

  // 2. 핵심 로직 함수
  Future<void> _startMeeting() async {
  // 권한 요청
  await _requestPermissions();

  setState(() {
    _isLoading = true; // 로딩 시작
  });

  try {
    final blePeripheral = FlutterBlePeripheral();
    final newUuid = const Uuid().v4();

    // AdvertiseData는 다시 원래의 단순한 형태로 만듭니다.
    final advertiseData = AdvertiseData(
      serviceUuid: newUuid,
    );
    
    final meetingCode = _generateMeetingCode();
    
    // Firestore에 모임 정보 기록
    await FirebaseFirestore.instance.collection('meetings').doc(meetingCode).set({
      'beacon_uuid': newUuid,
      'created_at': FieldValue.serverTimestamp(),
    });

    final isAdvertising = await blePeripheral.isAdvertising;
    if (!isAdvertising) {
      // ⬇️ FIX: start() 함수를 호출할 때 advertisingMode를 전달합니다.
      await blePeripheral.start(
        advertiseData: advertiseData,
      );
    }
    
    // UI 업데이트
    setState(() {
      _meetingCode = meetingCode;
      _isBroadcasting = true;
      _isLoading = false; // 로딩 끝
    });

  } catch (e) {
    // 에러 처리
    setState(() {
      _isLoading = false;
      _isBroadcasting = false;
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('오류 발생: $e')),
      );
    }
  }
}

  // 3. 보조 함수들
  Future<void> _requestPermissions() async {
    final permissions = [
      Permission.location,
      Permission.bluetooth,
      Permission.bluetoothScan,
      Permission.bluetoothAdvertise,
      Permission.bluetoothConnect,
    ];
    await permissions.request();
  }

  String _generateMeetingCode() {
    const length = 6;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final rnd = Random();
    return String.fromCharCodes(
      Iterable.generate(
        length,
        (_) => chars.codeUnitAt(rnd.nextInt(chars.length)),
      ),
    );
  }

  // 4. 화면을 그리는 build 메소드
  @override
  Widget build(BuildContext context) {
    // isBroadcasting 상태에 따라 다른 화면을 보여주도록 유지
    if (_isBroadcasting) {
      return Scaffold(
        appBar: AppBar(title: const Text('모임 진행 중')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Text('아래 코드를 친구에게 공유하세요!', style: TextStyle(fontSize: 18)),
              const SizedBox(height: 16),
              SelectableText(
                _meetingCode,
                style: const TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
              const SizedBox(height: 20),
              const CircularProgressIndicator(),
              const SizedBox(height: 10),
              const Text('비콘 신호를 보내는 중...'),
            ],
          ),
        ),
      );
    }

    // 기본 화면: 두 개의 버튼을 보여줌
    return Scaffold(
      appBar: AppBar(title: const Text('Moisil Finder')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton.icon(
              icon: const Icon(Icons.add_circle_outline),
              label: const Text('모임 시작하기'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(200, 60),
                textStyle: const TextStyle(fontSize: 20),
              ),
              onPressed: _isLoading ? null : _startMeeting,
            ),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              icon: const Icon(Icons.login),
              label: const Text('모임 참가하기'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(200, 60),
                textStyle: const TextStyle(fontSize: 20),
              ),
              onPressed: _showJoinDialog,
            ),
            if (_isLoading) ...[
              const SizedBox(height: 20),
              const CircularProgressIndicator(),
            ],
          ],
        ),
      ),
    );
  }

  final TextEditingController _textController =
      TextEditingController(); // 텍스트 입력을 위한 컨트롤러

  void _showJoinDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('모임 참가하기'),
          content: TextField(
            controller: _textController,
            autofocus: true,
            maxLength: 6,
            decoration: const InputDecoration(
              labelText: '모임 코드를 입력하세요',
              counterText: "",
            ),
          ),
          actions: [
            TextButton(
              child: const Text('취소'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            FilledButton(
              child: const Text('참가'),
              onPressed: () {
                final meetingCode = _textController.text.toUpperCase();
                if (meetingCode.isNotEmpty) {
                  Navigator.of(context).pop(); // 다이얼로그 닫기
                  _joinMeeting(meetingCode); // 모임 참가 로직 실행
                }
              },
            ),
          ],
        );
      },
    );
  }

  Future<void> _joinMeeting(String meetingCode) async {
    if (meetingCode.isEmpty) return;

    setState(() => _isLoading = true);

    // Firestore에 해당 모임 코드가 있는지 확인
    final doc = await FirebaseFirestore.instance
        .collection('meetings')
        .doc(meetingCode)
        .get();

    setState(() => _isLoading = false);

    if (doc.exists) {
      // 코드가 유효하면 FinderScreen으로 이동
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => FinderScreen(meetingCode: meetingCode),
        ),
      );
    } else {
      // 코드가 유효하지 않으면 에러 메시지 표시
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('존재하지 않는 모임 코드입니다.')));
    }
  }
}
